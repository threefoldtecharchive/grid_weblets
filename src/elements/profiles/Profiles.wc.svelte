<svelte:options tag="tf-profiles" />

<script lang="ts">
  import type { IFormField, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";
  import validateMnemonics from "../../utils/validateMnemonics";
  import validateProfileName, {
    isInvalid,
    validateSSH,
  } from "../../utils/validateName";
  // Components
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import Alert from "../../components/Alert.svelte";
  import QrCode from "../../components/QrCode.svelte";
  import { onDestroy, onMount } from "svelte";
  import { set_store_value } from "svelte/internal";

  const configs = window.configs?.baseConfig;
  const _balanceStore = window.configs?.balanceStore;
  let password: string = "";
  let configured: boolean = false;

  let profiles: IProfile[];
  let activeProfile: IProfile;
  let activeProfileId: string;
  let opened: boolean = false;
  let currentProfile: IProfile;
  let selectedIdx: string = "0";
  let bridgeAddress: string = "";
  let editable: boolean;

  // if (activeProfileId === activeProfile.id) {
  //   console.log("disabled is true");
  //   editable = false;
  // } else {
  //   editable = true;
  // }
  $: checked = editable;
  if (configured) {
    editable = false;
  }

  function _updateEditable(e: Event) {
    const input = e.target as HTMLInputElement;

    checked = input.checked;
    if (!checked) {
      const sshIsValid = activeProfile.sshKey == "";
      _updateError("sshKey", sshIsValid, "");
    }
  }

  let tabs: ITab[] = [];
  $: {
    let s = $configs;
    if (s) {
      profiles = s.profiles;
      activeProfile = profiles[selectedIdx];
      activeProfileId = s.activeProfile;
      currentProfile = configs.getActiveProfile();
      tabs = profiles.map((profile, i) => {
        return { label: profile.name || `Profile${i + 1}`, value: i.toString(), removable: i !== 0 }; // prettier-ignore
      });
      if (activeProfileId === activeProfile.id) {
        console.log("disabled is true");
        editable = false;
      } else {
        editable = true;
      }

      if (currentProfile) {
        if (
          currentProfile.networkEnv == "dev" ||
          currentProfile.networkEnv == "qa"
        ) {
          bridgeAddress =
            "GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG";
        } else if (currentProfile.networkEnv == "test") {
          bridgeAddress =
            "GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4";
        } else {
          bridgeAddress =
            "GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC";
        }
      }
    }
  }

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Profile Name", symbol: "name", placeholder: "Profile Name", type: "text" },
    // { label: "Network Environment", symbol: "networkEnv", type: "select", disabled: true, options: [
    //   { label: "Testnet", value: "test" },
    //   { label: "Devnet", value: "dev" }
    // ] },
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Enter Your Polkadot Mnemonics or TFChain secret", type: "password" },
    // { label: "TFChain Configurations Secret", symbol: "storeSecret", placeholder: "  Secret key used to encrypt your data on TFChain", type: "password" },
    { label: "Public SSH Key", symbol: "sshKey", placeholder: "Your public SSH key will be added as default to all deployments.", type: "text" },
  ];

  const twinField: IFormField = { label: "Twin ID", type: "number", symbol: "twinId", placeholder: "Loading Twin ID...", disabled: true }; // prettier-ignore
  const addressField: IFormField = { label: "Address", type: "text", symbol: "address", placeholder: "Loading Address...", disabled: true }; // prettier-ignore

  let message: string;
  function onEventHandler(event: "create" | "load" | "save") {
    message = configs[event](password);
    if (!message) {
      configured = true;
    }
  }

  function _updateError(symbol: string, valid: boolean, msg: string) {
    const idx = fields.findIndex((f) => f.symbol === symbol);
    fields[idx].error = valid ? null : msg;
  }

  let activating: boolean = false;
  async function onActiveProfile() {
    activating = true;

    let invalid = false;
    try {
      const mnIsValid = await validateMnemonics({...activeProfile, storeSecret: password }); // prettier-ignore
      invalid = !mnIsValid;

      _updateError(
        "mnemonics",
        mnIsValid,
        "No twin exists for this account on this network. Are you using the correct network?"
      );
    } catch (err) {
      console.log("Error", err);
    }

    if (checked) {
      const sshIsValid = activeProfile.sshKey !== "";
      invalid = invalid || !sshIsValid;
      _updateError("sshKey", sshIsValid, "Invalid SSH Key");
    }

    const nameIsValid = activeProfile.name !== "";
    invalid = invalid || !nameIsValid;
    _updateError("name", nameIsValid, "Please provide a profile name");

    activating = false;
    if (invalid) return;

    configs.setActiveProfile(activeProfile.id, password);
  }

  const onClickHandler = () => (opened = false);
  onMount(() => {
    window.addEventListener("click", onClickHandler);
    const session_password = sessionStorage.getItem("session_password");
    if (session_password) {
      password = session_password;
      configs.load(password);
      configured = true;
      // requestAnimationFrame(() => onActiveProfile());
    }
  });
  onDestroy(() => window.removeEventListener("click", onClickHandler));

  //  bind:active={activePassword} tabs={tabsPassword}
  const tabsPassword: ITab[] = [
    { label: "Activate Profile Manager", value: "load" },
    { label: "Create Profile Manager", value: "create" },
  ];
  let activePassword: string = "load";

  $: balanceStore = $_balanceStore;

  function syncValidateMnemonics(mnemonics: string): string | void {
    if (!window.configs.bip39.validateMnemonic(mnemonics)) {
      return "Invalid Mnemonics.";
    }
  }
</script>

<div class="profile-menu" on:click|stopPropagation={() => (opened = !opened)}>
  <button type="button">
    <span class="icon is-small">
      <i class="fas fa-user-cog" />
    </span>
  </button>
  {#if currentProfile}
    <div class="profile-active">
      <p style="margin-bottom: 1%;">{currentProfile.name}</p>
      {#if balanceStore.loading}
        <p>Loading Account Balance</p>
      {:else if balanceStore.balance !== null}
        <p>Balance: <span style="font-weight: bold;">{balanceStore.balance}</span> TFT</p>
        <p>Locked: <span style="padding-left: 2%;">{balanceStore.locked}</span> TFT</p>
      {/if}
    </div>
  {/if}
</div>

<div class={"profile-overlay" + (opened ? " is-active" : "")}>
  <section
    class={"profile-container" + (opened ? " is-active" : "")}
    on:click|stopPropagation
  >
    <div class="box">
      <div
        style="display: flex; justify-content: space-between; align-items: center;"
      >
        <h4 class="is-size-4">Profile Manager</h4>
        <!-- <p>
          <a
            target="_blank"
            href="https://library.threefold.me/info/manual/#/manual__weblets_profile_manager"
          >
            Quick start documentation</a
          >
        </p> -->

        {#if configured}
          <div>
            <button
              class="button is-outlined mr-2"
              style={`border-color: #1982b1; color: #1982b1`}
              type="button"
              disabled={Boolean(validateProfileName(activeProfile.name)) ||
              Boolean(syncValidateMnemonics(activeProfile.mnemonics)) ||
              checked
                ? Boolean(validateSSH(activeProfile.sshKey))
                : false}
              on:click={() => {
                selectedIdx = configs.addProfile();
                fields.forEach((_, i) => (fields[i].error = null));
              }}
            >
              + Add Profile
            </button>
            <button
              class="button mr-2"
              style={`background-color: #1982b1; color: #fff`}
              type="button"
              disabled={Boolean(validateProfileName(activeProfile.name)) ||
              Boolean(syncValidateMnemonics(activeProfile.mnemonics)) ||
              checked
                ? Boolean(validateSSH(activeProfile.sshKey))
                : false}
              on:click={onEventHandler.bind(undefined, "save")}
            >
              Save
            </button>
            <button
              class="button is-danger"
              style={`background-color: #FF5151; color: #fff`}
              type="button"
              on:click={() => {
                configured = false;
                sessionStorage.removeItem("session_password");
                configs.setActiveProfile(null, password);
                password = "";
              }}
            >
              Deactivate
            </button>
          </div>
        {/if}
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

      {#if configured}
        <Tabs
          active={selectedIdx}
          {tabs}
          centered={false}
          on:removed={({ detail }) => {
            selectedIdx = configs.deleteProfile(detail, selectedIdx);
          }}
          on:select={(p) => {
            fields.forEach((_, i) => (fields[i].error = null));
            selectedIdx = p.detail;
          }}
          on:init={() => (selectedIdx = "0")}
        />

        <div class="is-flex is-justify-content-flex-end">
          <button
            class={"button" + (activating ? " is-loading" : "")}
            style={`background-color: #1982b1; color: #fff`}
            disabled={activating ||
            activeProfileId === activeProfile?.id ||
            Boolean(validateProfileName(activeProfile.name)) ||
            Boolean(syncValidateMnemonics(activeProfile.mnemonics)) ||
            checked
              ? Boolean(validateSSH(activeProfile.sshKey))
              : false}
            on:click={onActiveProfile}
          >
            {activeProfileId === activeProfile?.id ? "Active" : "Activate"}
          </button>
        </div>

        {#if activeProfile}
          <div style="display: flex; justify-content: space-between;">
            <div
              style={activeProfileId === activeProfile?.id
                ? "width: 75%;"
                : "width: 100%;"}
            >
              <Input
                bind:data={activeProfile.name}
                field={{
                  ...fields[0],
                  error:
                    activeProfile.name == ""
                      ? null
                      : validateProfileName(activeProfile.name),
                  disabled: activeProfileId === activeProfile.id,
                }}
                on:input={() => {
                  fields[0].error = validateProfileName(activeProfile.name);
                }}
              />

              <Input
                bind:data={activeProfile.mnemonics}
                field={{
                  ...fields[1],
                  error:
                    activeProfile.mnemonics == ""
                      ? null
                      : syncValidateMnemonics(activeProfile.mnemonics),
                  disabled: activeProfileId === activeProfile.id,
                }}
              />

              {#if activeProfileId === activeProfile?.id}
                <Input data={$configs.twinId} field={twinField} />
                <Input data={$configs.address} field={addressField} />
              {/if}
              <div style="display: flex; align-items: center;">
                <div style="margin-right: 15px; width: 100%;">
                  <Input
                    bind:data={activeProfile.sshKey}
                    field={{
                      ...fields[2],

                      disabled: !checked,
                      error:
                        activeProfile.sshKey != "" && checked
                          ? validateSSH(activeProfile.sshKey)
                          : null,
                    }}
                  />
                </div>
                <div
                  style="margin-top: 30px;"
                  data-my-tooltip="On disable the deployed solutions'll be inaccessible."
                >
                  <Input
                    data={editable}
                    field={{
                      label: "",
                      symbol: "editable",
                      type: "checkbox",
                    }}
                    on:input={_updateEditable}
                  />
                </div>
              </div>
            </div>

            {#if activeProfileId === activeProfile?.id}
              <div style="margin: 10px; border-left: 1px solid #afafaf;" />
              <div style="width: 25%; padding: 3% 1%; text-align: center;">
                <p class="label">
                  Scan code using Threefold connect to send tokens
                </p>
                {#if $configs.twinId}
                  <QrCode
                    value="TFT:{bridgeAddress}?message=twin_{$configs.twinId}&sender=me&amount=100"
                    size="250"
                  />
                {:else}
                  <p class="label">Loading scan code...</p>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      {:else}
        <Tabs
          bind:active={activePassword}
          tabs={tabsPassword}
          centered={false}
        />

        <form
          on:submit|preventDefault={onEventHandler.bind(
            undefined,
            activePassword
          )}
        >
          <Input
            bind:data={password}
            field={{
              label: "Password",
              type: "password",
              placeholder: "Profile Manager Password",
              symbol: "secret",
              tooltip:
                activePassword === "load"
                  ? "Password to activate a previously configured profile manager"
                  : "Password will be used to encrypt data in the browser",
            }}
          />

          {#if message}
            <Alert type="danger" {message} />
          {/if}

          <div style="display: flex; justify-content: center;">
            <button
              class="button"
              style={`background-color: #1982b1; color: #fff`}
              type="submit"
              disabled={password === ""}
            >
              {activePassword === "load"
                ? "Load Profiles"
                : "Create New Profile Manager"}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </section>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");
  [data-my-tooltip]:before {
    content: attr(data-my-tooltip);
    position: absolute;
    opacity: 0;
  }

  [data-my-tooltip]:hover:before {
    opacity: 1;
    padding: 10px 15px;
    border-radius: 5px;
    background-color: rgba(51, 51, 51, 0.9);
    color: white;
    margin-top: -70px;
    margin-left: -120px;
    // margin-right: 110px; /*setting it above. to the left. You can play with this */
  }
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

  .vertical-line {
    border-left: 4px solid black;
    height: 100%;
  }
</style>
