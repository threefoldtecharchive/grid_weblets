<svelte:options tag="tf-profiles" />

<script lang="ts">
  import type { IProfile } from "../../types/Profile";
  import { SSH_REGEX } from "../../utils/validateName";
  // Components
  import QrCode from "../../components/QrCode.svelte";
  import { onMount } from "svelte";
  import Input from "../../components/Input.svelte";
  import { fb, form, validators } from "tf-svelte-rx-forms";
  import getGrid from "../../utils/getGrid";
  import { generateKeyPair } from "web-ssh-keygen";
  import md5 from "crypto-js/md5";
  import { enc } from "crypto-js";
  import { decrypt } from "crypto-js/aes";

  const balanceStore = window.configs.balanceStore;
  const baseConfigStore = window.configs.baseConfig;

  let init = false;
  let show = false;
  function setShow(value: boolean) {
    return () => (show = value);
  }

  const bridge =
    process.env.NETWORK === "main"
      ? "GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC"
      : process.env.NETWORK === "test"
      ? "GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4"
      : "GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG";

  export const noBalanceMessage = "Your balance is not enough.";
  const mnemonics = fb.control<string>(
    "",
    [
      validators.required("Mnemonics is required."),
      ctrl => {
        if (!window.configs.bip39.validateMnemonic(ctrl.value)) {
          return { message: "Mnemonic doesn't seem to be valid." };
        }
      },
    ],
    [
      async ctrl => {
        try {
          await getGrid({ networkEnv: process.env.NETWORK, mnemonics: ctrl.value } as any, _ => _);
        } catch (e) {
          return { message: e.message };
        }
      },

      // async ctrl => {
      //   const userBalance = await getBalance({ networkEnv: process.env.NETWORK, mnemonics: ctrl.value } as any);
      //   if (userBalance.free < 1) {
      //     return { message: noBalanceMessage };
      //   }
      // },
    ],
  );
  let mnemonicsInput: HTMLDivElement;
  $: mnemonics$ = $mnemonics;
  $: if (init) sessionStorage.setItem("mnemonics", mnemonics$.valid ? mnemonics$.value : "");

  const sshKey = fb.control<string>("", [
    validators.required("Public SSH Key is required."),
    ctrl => {
      if (!SSH_REGEX.test(ctrl.value)) {
        return { message: "Public SSH Key doesn't seem to be valid." };
      }
    },
  ]);
  let sshKeyInput: HTMLDivElement;
  $: sshKey$ = $sshKey;
  let __sshKey: string;
  let __mnemonic: string;
  $: if (!mnemonics$.valid) __mnemonic = undefined;
  $: if (init && mnemonics$.valid && !sshKey$.valid && __mnemonic !== mnemonics$.value) {
    __mnemonic = mnemonics$.value;
    readSSH().then(key => {
      if (key) {
        __sshKey = key;
        sshKey.setValue(key);
      }
    });
  }
  $: if (init && mnemonics$.valid && sshKey$.valid && (__sshKey !== sshKey$.value || __mnemonic !== mnemonics$.value)) {
    __sshKey = sshKey$.value;
    __mnemonic = mnemonics$.value;
    storeSSH(sshKey$.value);
  }

  let sshStatus: "read" | "write" = undefined;
  async function readSSH() {
    sshStatus = "read";
    const grid = await getGrid({ networkEnv: process.env.NETWORK, mnemonics: mnemonics$.value } as any, _ => _);
    const metadata = await grid.kvstore?.get({ key: "metadata" });
    sshStatus = undefined;
    if (metadata) {
      return JSON.parse(metadata).sshkey;
    }
  }

  async function storeSSH(sshkey: string) {
    if (sshkey === (await readSSH())) return;
    sshStatus = "write";
    const grid = await getGrid({ networkEnv: process.env.NETWORK, mnemonics: mnemonics$.value } as any, _ => _);
    await grid.kvstore.set({ key: "metadata", value: JSON.stringify({ sshkey }) });
    sshStatus = undefined;
  }

  let creatingAccount = false;
  async function onCreateAccount() {
    creatingAccount = true;
    const grid = new window.configs.grid3_client.GridClient(
      process.env.NETWORK as any,
      "",
      "test",
      new window.configs.client.HTTPMessageBusClient(0, "", "", ""),
    );
    grid._connect();
    const createdAccount = await grid.tfchain.createAccount("::1");
    mnemonics.setValue(createdAccount.mnemonic);
    mnemonics.markAsDirty();
    mnemonics.markAsTouched();
    await mnemonics.validate();
    creatingAccount = false;
  }

  let generatingSSH = false;
  async function onGenerateSSH() {
    generatingSSH = true;

    const keys = await generateKeyPair({
      alg: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
      name: "Threefold",
      size: 4096,
    });

    const grid = await getGrid({ networkEnv: process.env.NETWORK, mnemonics: mnemonics$.value } as any, _ => _);
    await grid.kvstore.set({
      key: "metadata",
      value: JSON.stringify({ sshkey: keys.publicKey }),
    });

    sshKey.setValue(keys.publicKey);
    await sshKey.validate();

    const data = `data:text/raw;charset=utf-8,${encodeURIComponent(keys.privateKey)}`;
    const a = document.createElement("a");
    a.download = "id_rsa";
    a.href = data;
    document.body.appendChild(a);
    a.click();
    a.remove();

    generatingSSH = false;
  }

  let twinId: number;
  let address: string;
  let __validMnemonic = false;
  $: if (mnemonics$.valid && !__validMnemonic && sshKey$.valid) {
    __validMnemonic = true;
    getGrid({ networkEnv: process.env.NETWORK, mnemonics: mnemonics$.value } as any, _ => _)
      .then(grid => {
        address = grid.twins.client.client.address;
        return grid.twins.get_my_twin_id();
      })
      .then(twin => {
        twinId = twin;
        window.configs.baseConfig.set({
          networkEnv: process.env.NETWORK,
          mnemonics: mnemonics$.value,
          sshKey: sshKey$.value,
          address,
          twinId,
        });
      });
  } else if (!mnemonics$.valid) {
    __validMnemonic = false;
    twinId = undefined;
    address = undefined;
    window.configs.baseConfig.set(null);
  }

  $: profile$ = $baseConfigStore;
  $: balanceStore$ = $balanceStore;

  let migrateMode = false;
  const PREFIX = "v2";
  let passwordInput: HTMLFormElement;
  const password = fb.control<string>("", [validators.required("Password is required.")]);
  $: password$ = $password;

  let migrating = false;
  async function onMigrate() {
    migrating = true;

    const __getGrid = (secret = mnemonics$.value) => getGrid({ networkEnv: process.env.NETWORK, mnemonics: mnemonics$.value, storeSecret: secret } as any, _ => _); // prettier-ignore

    const oldClient = await __getGrid(password$.value);
    const newClient = await __getGrid();
    const oldDB = oldClient.kvstore;
    const newDB = newClient.kvstore;

    try {
      const oldKeys = await oldClient.kvstore.list();
      let failedCount = 0;
      let alreadyMigratedCount = 0;
      const extrinsics = [];
      for (const oldKey of oldKeys) {
        try {
          const oldValue = await oldDB.get({ key: oldKey });
          const newValue = newDB.client.kvStore.encrypt(oldValue);
          extrinsics.push(newDB.client.client.api.tx.tfkvStore.set(oldKey, newValue));
        } catch {
          try {
            await newDB.get({ key: oldKey });
            alreadyMigratedCount++;
            console.log(`${oldKey} key is migrated`);
          } catch (error) {
            failedCount++;
          }
        }
      }
      if (extrinsics.length > 0) {
        try {
          await newClient.utility.batchAll({ extrinsics });
        } catch (e) {
          throw Error(`keys are not migrated due to: ${e}`);
        }
      }
      console.log(
        `Migrated keys: ${extrinsics.length}, already migrated keys: ${alreadyMigratedCount}, failed keys: ${failedCount}`,
      );
      if (failedCount > 0 && extrinsics.length === 0) {
        throw Error("storeSecret is wrong. Please enter the right storeSecret.");
      } else if (failedCount > 0 && extrinsics.length !== 0) {
        throw Error(
          "Part of the keys are migrated successfully, but still some keys are not migrated. Maybe they are encrypted with different password or not encrypted",
        );
      }
    } catch {
      /* pass */
    }

    await oldClient.disconnect();
    migrating = false;
  }

  let mounted: 0 | 1 | 2 = 0;
  onMount(() => (mounted = 1));

  $: if (mounted === 1 && mnemonicsInput && sshKeyInput && passwordInput) {
    mounted = 2;

    form(mnemonicsInput.querySelector("input"), mnemonics);
    form(sshKeyInput.querySelector("textarea"), sshKey);
    form(passwordInput.querySelector("input"), password);
    const mn = sessionStorage.getItem("mnemonics");
    if (mn) {
      requestAnimationFrame(() => {
        readSSH()
          .then(key => {
            sshKey.setValue(key);
          })
          .finally(() => {
            mnemonics.setValue(mn);
            init = true;
          });
      });
    } else {
      init = true;
    }
  }
</script>

<div class="profile-menu" on:mousedown={setShow(true)}>
  <button type="button">
    <span class="icon is-small">
      <i class="fas fa-user-cog" />
    </span>
  </button>
  {#if profile$}
    <div class="profile-active">
      {#if balanceStore$.loading}
        <p>Loading Account Balance</p>
      {:else if balanceStore$.balance !== null}
        <p>Balance: <span style="font-weight: bold;">{balanceStore$.balance}</span> TFT</p>
        <p>Locked: <span style="padding-left: 2%;">{balanceStore$.locked}</span> TFT</p>
      {/if}
    </div>
  {/if}
</div>

<div class="profile-overlay" class:is-active={show} on:mousedown={setShow(false)}>
  <section class="profile-container" class:is-active={show} on:mousedown|stopPropagation>
    <div class="box">
      <div class="is-flex is-justify-content-space-between">
        <h4 class="is-size-4">Profile Manager</h4>
        <button
          class="button"
          class:is-link={migrateMode}
          class:is-loading={migrating}
          disabled={migrating || !mnemonics$.valid}
          on:click={() => (migrateMode = !migrateMode)}>Migrate</button
        >
      </div>
      <p class="mt-4">
        Please visit <a
          href="https://library.threefold.me/info/manual/#/manual__weblets_profile_manager"
          target="_blank"
        >
          the manual
        </a>
        to <strong>get started.</strong>
      </p>
      <hr />

      <section style:display={migrateMode ? "block" : "none"}>
        <form on:submit|preventDefault={onMigrate} bind:this={passwordInput}>
          <Input
            field={{
              label: "Password",
              placeholder: "Store Secret",
              symbol: "password",
              error: password$.touched ? password$.error : undefined,
              type: "password",
              disabled: migrating,
            }}
            data={password$.value}
            invalid={!password$.valid}
          />

          <div class="is-flex is-justify-content-center">
            <button
              class="button is-success"
              style:background-color="#1982b1"
              style:color="white"
              disabled={!password$.valid || migrating}
              class:is-loading={migrating}
            >
              Migrate
            </button>
          </div>
        </form>
      </section>

      <section style:display={migrateMode ? "none" : "block"}>
        <form on:submit|preventDefault>
          <div class="is-flex is-justify-content-space-between">
            <div style:width="100%" bind:this={mnemonicsInput}>
              <Input
                field={{
                  label: "Mnemonics",
                  symbol: "mnemonics",
                  type: "password",
                  error: (mnemonics$.touched || mnemonics$.dirty) && !mnemonics$.pending ? mnemonics$.error : undefined,
                  placeholder: "Mnemonics",
                  disabled: mnemonics$.pending || creatingAccount,
                }}
                data={mnemonics$.value}
                invalid={!mnemonics$.valid}
              />
            </div>

            <button
              class="button is-primary ml-2 is-small"
              disabled={mnemonics$.valid || mnemonics$.pending || creatingAccount}
              style:margin-top="36px"
              on:click={onCreateAccount}
              type="button"
              style:background-color="#1982b1"
              style:color="white"
            >
              {mnemonics$.pending
                ? "Validating Mnemonics..."
                : creatingAccount
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </div>

          <div class="is-flex is-justify-content-space-between">
            <div style:width="100%" bind:this={sshKeyInput}>
              <Input
                field={{
                  label: "Public SSH Key",
                  symbol: "sshKey",
                  type: "textarea",
                  error: sshKey$.touched || sshKey$.dirty ? sshKey$.error : undefined,
                  placeholder: "Your public SSH Key",
                  loading: sshStatus !== undefined || generatingSSH,
                  disabled: sshStatus !== undefined,
                }}
                data={sshKey$.value}
                invalid={!sshKey$.valid}
              />
            </div>

            <button
              class="button is-primary ml-2 is-small"
              class:is-loading={generatingSSH}
              style:margin-top="32px"
              disabled={sshStatus !== undefined || sshKey$.valid || generatingSSH}
              type="button"
              on:click={onGenerateSSH}
              style:background-color="#1982b1"
              style:color="white"
            >
              {sshStatus === "read" ? "Reading..." : sshStatus === "write" ? "Storing..." : "Generate SSH Keys"}
            </button>
          </div>
        </form>

        {#if twinId !== undefined && address !== undefined}
          <div class="is-flex is-justify-content-space-between">
            <div class="is-flex-grow-1 mr-5">
              <Input field={{ label: "Twin ID", disabled: true, symbol: "twinId", type: "text" }} data={twinId} />
              <Input field={{ label: "Address", disabled: true, symbol: "address", type: "text" }} data={address} />
            </div>
            <QrCode data="TFT:{bridge}?message=twin_{twinId}&sender=me&amount=100" />
          </div>
        {/if}
      </section>
    </div>
  </section>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");

  .profile-menu {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: white;
    border-radius: 6px;
    border: 1px solid #ddd8d8;
    cursor: pointer;
    margin: 10px;
    button {
      height: 60px;
      width: 60px;
      border-radius: 70%;
      border: none;
      cursor: inherit;

      font-weight: bold;
      font-size: 20px;
    }

    .profile-active {
      padding-left: 15px;

      > p:first-of-type {
        font-weight: bold;
        margin-bottom: -5px;
      }

      > p:last-of-type span {
        font-weight: bold;
      }
    }
  }

  .profile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(black, 0.8);
    z-index: 998;

    transition-timing-function: ease;
    transition-property: opacity, visibility;
    transition-duration: 0.35s;

    opacity: 0;
    visibility: hidden;
    pointer-events: none;

    &.is-active {
      opacity: 1;
      visibility: visible;
      pointer-events: all;
    }
  }

  .profile-container {
    position: fixed;
    top: 100px;
    right: 15px;
    width: calc(100% - 275px);
    padding: 15px;

    /* scroll */
    max-height: calc(100vh - 115px);
    overflow-y: auto;

    transition-duration: 0.35s;
    transition-property: transform, opacity, visibility;
    transition-timing-function: ease;
    transform: translateY(50px);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .is-active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
    pointer-events: all;
  }

  // .vertical-line {
  //   border-left: 4px solid black;
  //   height: 100%;
  // }
</style>
