<svelte:options tag="tf-profiles" />

<script lang="ts" context="module">
  import { form } from "tf-svelte-rx-forms";
  import QrCode from "../../components/QrCode.svelte";
  import {
    generateSSH,
    GetTwinAndAddress,
    getTwinAndAddress,
    migrate,
    mnemonics,
    noBalanceMessage,
    password,
    readSSH,
    sshKey,
    storeSSH,
  } from "../../types/profileManager";

  const nw = window.env?.NETWORK;
  const bridge = window.env?.BRIDGE_TFT_ADDRESS;
</script>

<script lang="ts">
  let showMnemonicsPassword = false;
  let active = false;
  let migrateMode = false;
  let showMigratePassword = false;
  let migrating = false;
  let migratingError = "";

  // Migrate
  $: password$ = $password;
  $: disableMigrate = !password$.valid || migrating;
  $: passwordHasError = (password$.touched || password$.dirty) && !password$.valid && !!password$.error;

  let migrationDetails: ReturnType<typeof migrate> extends Promise<infer T> ? T : unknown;
  function onMigrate() {
    migrating = true;
    migratingError = "";
    migrationDetails = null;

    migrate(mnemonics$.value, password$.value)
      .then(_migrationDetails => {
        migrationDetails = _migrationDetails;
        if (_migrationDetails.failed > 0) {
          password.setValue(password$.value, { error: `Failed to migrate ${_migrationDetails.failed} keys.` });
        }
      })
      .catch(err => password.setValue(password$.value, { error: err.message }))
      .finally(() => (migrating = false));
  }

  // Mnemonics
  let mnemonicsLoading = false;
  let mnemonicsError = "";
  let createdNewAccount = false;
  $: mnemonics$ = $mnemonics;
  $: mnemonicsIsDisabled = mnemonicsLoading;
  $: mnemonicsInvalid = (mnemonics$.touched || mnemonics$.dirty) && !mnemonics$.valid && !mnemonicsIsDisabled;
  $: mnemonicsHasError = !mnemonics$.pending && ((mnemonicsInvalid && mnemonics$.error) || mnemonicsError);

  async function createAccount() {
    mnemonicsLoading = true;
    createdNewAccount = false;
    mnemonicsError = "";
    const grid = new window.configs.grid3_client.GridClient({
      network: window.env.NETWORK,
      mnemonic: "",
      storeSecret: "test",
    });
    grid._connect();

    try {
      const relay = grid.getDefaultUrls(window.env.NETWORK).relay.slice(6);
      const account = await grid.tfchain.createAccount(relay, null);
      mnemonics.setValue(account.mnemonic, { error: "Please fund your wallet then refresh." });
      mnemonics.markAsDirty();
      mnemonics.markAsTouched();
      createdNewAccount = true;
    } catch (e) {
      mnemonicsError = e.message;
    }
    mnemonicsLoading = false;
  }

  // Store mnemonics in sessionStore
  $: if (mnemonics$.valid || mnemonics$.error === noBalanceMessage) {
    sessionStorage.setItem("mnemonics", mnemonics$.value);
  } else {
    sessionStorage.removeItem("mnemonics");
  }

  // Get mnemonics from sessionStore (if exists)
  $: {
    const seeds = sessionStorage.getItem("mnemonics");
    if (seeds) {
      mnemonics.setValue(seeds);
      mnemonics.markAsDirty();
      mnemonics.markAsTouched();
      mnemonicsLoading = true;
      mnemonics.validate().finally(() => (mnemonicsLoading = false));
    }
  }

  // Fetch twinId & address when seeds are valid
  let twinAndAddress: GetTwinAndAddress = null;
  $: if ((mnemonics$.valid || mnemonics$.error === noBalanceMessage) && !twinAndAddress) {
    getTwinAndAddress(mnemonics$.value).then(data => (twinAndAddress = data));
  } else if (!mnemonics$.valid && mnemonics$.error !== noBalanceMessage && twinAndAddress) {
    twinAndAddress = null;
  }

  // SSH
  let sshLoading = false;
  let sshError = "";
  $: sshKey$ = $sshKey;
  $: sshIsDisabled = !mnemonics$.valid || sshLoading;
  $: sshInvalid = (sshKey$.touched || sshKey$.dirty) && !sshKey$.valid && !sshIsDisabled;
  $: sshHasError = (sshInvalid && sshKey$.error) || sshError;

  // Read SSH Key
  let SSH_KEY: string;
  $: if (mnemonics$.valid && !sshKey$.valid && !sshKey$.pending && !sshLoading && SSH_KEY !== sshKey$.value) {
    sshLoading = true;
    readSSH(mnemonics$.value)
      .then(ssh => {
        SSH_KEY = ssh;
        sshKey.setValue(ssh);
        sshKey.markAsDirty();
        sshKey.markAsTouched();
      })
      .finally(() => (sshLoading = false));
  }

  // Store SSH Key
  $: if (
    mnemonics$.valid &&
    sshKey$.valid &&
    !sshKey$.pending &&
    !sshLoading &&
    SSH_KEY !== sshKey$.value &&
    SSH_KEY !== sshKey$.value.trim()
  ) {
    SSH_KEY = sshKey$.value;
    sshLoading = true;
    sshKey$.value = sshKey$.value.trim();
    storeSSH(mnemonics$.value, sshKey$.value)
      .then(stored => {
        if (!stored) {
          sshKey.setValue(sshKey$.value, { error: "Failed to store sshkey." });
        }
      })
      .finally(() => (sshLoading = false));
  }

  function onGenerateSSH() {
    sshLoading = true;
    generateSSH(mnemonics$.value)
      .then(keys => {
        sshKey.setValue(keys.publicKey);
        sshKey.markAsTouched();
        sshKey.markAsDirty();
      })
      .catch(err => sshKey.setValue(sshKey$.value, { error: err.message }))
      .finally(() => (sshLoading = false));
  }

  // Publich profile to all weblets
  const baseConfig = window.configs.baseConfig;
  $: baseConfig$ = $baseConfig;
  $: if (mnemonics$.valid && sshKey$.valid && twinAndAddress && !baseConfig$) {
    requestAnimationFrame(() => {
      baseConfig.set({
        networkEnv: nw,
        mnemonics: mnemonics$.value,
        sshKey: sshKey$.value,
        address: twinAndAddress.address,
        twinId: twinAndAddress.twinId,
      });
    });
  } else if (!(mnemonics$.valid && sshKey$.valid && twinAndAddress) && baseConfig$) {
    requestAnimationFrame(baseConfig.set.bind(baseConfig, null));
  }

  // balance store
  const balance = window.configs.balanceStore;
  $: balance$ = $balance;
</script>

<div class="box is-flex is-align-items-center" style:cursor="pointer" on:click={() => (active = true)}>
  <span
    style:display={mnemonics$.pending || mnemonicsLoading ? "none" : "block"}
    style:background-color="#ddd8d8"
    style:border-radius="50%"
    class="mr-2"
  >
    <i class="fas fa-user-cog" style:padding="1rem" style:font-size="1rem" />
  </span>
  <span
    style:display={mnemonics$.pending || mnemonicsLoading ? "block" : "none"}
    style:background-color="#ddd8d8"
    style:border-radius="50%"
    class="mr-2"
  >
    <i class="fa-solid fa-spinner fa-spin-pulse" style:padding="0.7rem" style:font-size="1.5rem" />
  </span>
  <div style:display={mnemonics$.pending || mnemonicsLoading ? "block" : "none"}>
    <p class="grey-light"><strong>Loading account... </strong></p>
  </div>
  {#if baseConfig$}
    <div>
      {#if balance$.loading}
        <p><strong>Loading account balance...</strong></p>
      {:else}
        <p>Balance:&nbsp;<strong>{balance$.balance} TFT</strong></p>
        <p>Locked:&nbsp;<strong>{balance$.locked} TFT</strong></p>
      {/if}
    </div>
  {/if}
</div>

<div class="modal" class:is-active={active}>
  <div class="modal-background" />
  <div class="modal-card" style:width="80%" style:max-width="80%">
    <header class="modal-card-head">
      <div class="modal-card-title">
        <h4 class="has-text-weight-bold mb-1">Profile Manager</h4>
        <span class="is-size-6">
          Please visit
          <a href="https://manual.grid.tf/weblets/weblets_profile_manager.html" target="_blank"> the manual </a>
          <span class="has-text-weight-medium">get started.</span>
        </span>
      </div>
      <button
        class="button is-primary mr-2 is-small"
        on:click={function () {
          migrateMode = !migrateMode;
          this.blur();
        }}
        disabled={!mnemonics$.valid || migrating}
        style:background-color={migrateMode ? "#1982b1" : "transparent"}
        style:color={migrateMode ? "white" : "#1982b1"}
        style:border="1px solid #1982b1"
      >
        {migrateMode ? "Back To Profile" : "Got Old Deployments? Migrate Now!"}
      </button>
      <button
        class="button is-danger is-small"
        on:click={() => {
          active = false;
          migrateMode = false;
        }}
        style:background-color="#e0e0e0"
        style:color="black"
        disabled={migrating}
      >
        Close
      </button>
    </header>
    <section class="modal-card-body">
      <div style:display={migrateMode ? "block" : "none"}>
        <div class="field">
          <label class="label mb-0" for="password">Password</label>
          <p class="mb-2 is-size-6 has-text-grey">
            Please insert your old password (aka. <strong>store secret</strong>) which you want to migrate your
            deployments from.
          </p>
          <div class="control has-icons-right" class:is-loading={migrating}>
            <input
              id="password"
              use:form={password}
              class="input"
              type={showMigratePassword ? "text" : "password"}
              placeholder="Store Secret"
              value={password$.value}
              class:is-danger={passwordHasError}
              on:input={() => {
                if (migrationDetails) {
                  migrationDetails = null;
                }

                if (migratingError) {
                  migratingError = "";
                }
              }}
            />
            {#if !migrating}
              <i
                class="fas"
                class:fa-eye={showMigratePassword}
                class:fa-eye-slash={!showMigratePassword}
                style:position="absolute"
                style:top="12px"
                style:right="10px"
                style:cursor="pointer"
                on:click|stopPropagation={() => (showMigratePassword = !showMigratePassword)}
              />
            {/if}
            {#if passwordHasError}
              <p class="help is-danger">
                {password$.error}
              </p>
            {/if}
          </div>
        </div>

        {#if migrationDetails || migratingError}
          <div class="notification is-light" class:is-info={!!migrationDetails} class:is-danger={migratingError}>
            {migrationDetails
              ? `Migration Finished. Total keys: ${migrationDetails.total}, Already migrated keys: ${
                  migrationDetails.migrated
                }, Migrated keys: ${
                  migrationDetails.total - (migrationDetails.failed + migrationDetails.migrated)
                }, Failed to migrate: ${
                  migrationDetails.failed
                } keys. Maybe the failed keys are encrypted with a different password or not encrypted or a disconnection happened while migrating.`
              : migratingError}
          </div>
        {/if}

        <div class="is-flex is-justify-content-center">
          <button
            class="button is-primary"
            disabled={disableMigrate}
            on:click={onMigrate}
            class:is-loading={migrating}
            style:background-color="#1982b1"
            style:color="white"
          >
            Migrate
          </button>
        </div>
      </div>

      <div style:display={migrateMode ? "none" : "block"}>
        <div class="field">
          <label class="label mb-0" for="mnemonics">Mnemonics</label>
          <p class="mb-2 is-size-6 has-text-grey">
            Mnemonics are your private key. They are used to represent you on the ThreeFold Grid. You can paste existing
            mnemonics or click the 'Create Account' button to create an account and generate mnemonics.
          </p>
          <div class="control has-icons-right">
            <div class="is-flex is-justify-content-space-between">
              <div class="control is-flex-grow-1 mr-3" class:is-loading={mnemonicsIsDisabled || mnemonics$.pending}>
                <input
                  id="mnemonics"
                  use:form={mnemonics}
                  class="input"
                  type={showMnemonicsPassword ? "text" : "password"}
                  placeholder="Mnemonics"
                  class:is-danger={!mnemonics$.pending && mnemonicsInvalid}
                  class:is-success={mnemonics$.valid}
                  disabled={mnemonicsIsDisabled || mnemonics$.pending}
                  value={mnemonics$.value}
                  on:input={() => {
                    if (createdNewAccount) {
                      createdNewAccount = false;
                    }

                    if (sshKey$.valid) {
                      sshKey.reset();
                    }
                  }}
                />
                {#if !mnemonicsIsDisabled && !mnemonics$.pending}
                  <i
                    class="fas"
                    class:fa-eye={showMnemonicsPassword}
                    class:fa-eye-slash={!showMnemonicsPassword}
                    style:position="absolute"
                    style:top="12px"
                    style:right="10px"
                    style:cursor="pointer"
                    on:click|stopPropagation={() => (showMnemonicsPassword = !showMnemonicsPassword)}
                  />
                {/if}
                {#if mnemonicsHasError}
                  <p class="help is-danger">
                    {mnemonicsError || mnemonics$.error}
                  </p>
                {/if}
                {#if mnemonics$.pending}
                  <p class="help grey-light">
                    Validating mnemonics <i class="px-1 fa-solid fa-ellipsis fa-flip" />
                  </p>
                {/if}
              </div>
              <button
                class="button is-small is-primary mt-1"
                class:is-loading={mnemonicsIsDisabled}
                disabled={mnemonicsIsDisabled ||
                  mnemonics$.pending ||
                  mnemonics$.error === noBalanceMessage ||
                  mnemonics$.valid ||
                  createdNewAccount}
                on:click={createAccount}
                style:background-color="#1982b1"
                style:color="white"
              >
                Create Account
              </button>
            </div>
            {#if createdNewAccount}
              <div class="notification is-warning is-light mt-2">
                <i class="fa-sharp fa-solid fa-triangle-exclamation" />
                Please make sure to store your mnemonics somewhere safe to be able to access your deployments later on. There
                is no way for neither you nor ThreeFold nor anybody else to recover lost mnemonics.
              </div>
            {/if}
          </div>
        </div>

        {#if twinAndAddress}
          <QrCode data="TFT:{bridge}?message=twin_{twinAndAddress.twinId}&sender=me&amount=100" />
        {/if}

        <div class="field mt-2">
          <label class="label mb-0" for="ssh">Public SSH Key</label>
          <p class="mb-2 is-size-6 has-text-grey">
            SSH Keys are used to authenticate you to the deployment instance for management purposes. If you don't have
            an SSH Key or are not familiar, we can generate one for you.
          </p>
          <div class="is-flex is-justify-content-space-between">
            <div class="control is-flex-grow-1 mr-3" class:is-loading={sshLoading}>
              <textarea
                id="ssh"
                use:form={sshKey}
                class="textarea"
                placeholder="Public SSH Key"
                style:resize="none"
                disabled={sshIsDisabled}
                class:is-danger={sshInvalid}
                class:is-success={sshKey$.valid}
                value={sshKey$.value}
              />
              {#if sshHasError}
                <p class="help is-danger">
                  {sshHasError || sshKey$.error}
                </p>
              {/if}
            </div>
            <button
              class="button is-small is-primary"
              class:is-loading={sshLoading}
              disabled={sshIsDisabled || sshKey$.valid}
              on:click={onGenerateSSH}
              style:background-color="#1982b1"
              style:color="white"
            >
              Generate SSH Keys
            </button>
          </div>
        </div>

        {#if twinAndAddress}
          <div class="field mt-2">
            <label class="label" for="twin">Twin ID</label>
            <div class="control">
              <input id="twin" class="input" type="text" value={twinAndAddress.twinId} disabled />
            </div>
          </div>

          <div class="field mt-2">
            <label class="label" for="address">Address</label>
            <div class="control">
              <input id="address" class="input" type="text" value={twinAndAddress.address} disabled />
            </div>
          </div>
        {/if}
      </div>
    </section>
    <footer class="modal-card-foot" />
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");
</style>
