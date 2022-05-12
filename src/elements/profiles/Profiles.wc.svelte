<svelte:options tag="tf-profiles" />

<script lang="ts">
  import type { IFormField, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";
  import validateMnemonics from "../../utils/validateMnemonics";

  // Components
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import Alert from "../../components/Alert.svelte";
  import { onDestroy, onMount } from "svelte";

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

  let tabs: ITab[] = [];
  $: {
    let s = $configs;
    if (s) {
      profiles = s.profiles;
      activeProfile = profiles[selectedIdx];
      activeProfileId = s.activeProfile;
      currentProfile = configs.getActiveProfile();
      tabs = profiles.map((profile, i) => {
        return { label: profile.name || `Profile ${i + 1}`, value: i.toString(), removable: i !== 0 }; // prettier-ignore
      });
    }
  }

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Profile Name", symbol: "name", placeholder: "Profile Name", type: "text" },
    // { label: "Network Environment", symbol: "networkEnv", type: "select", disabled: true, options: [
    //   { label: "Testnet", value: "test" },
    //   { label: "Devnet", value: "dev" }
    // ] },
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Enter Your Mnemonics", type: "password" },
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
        "Invalid Mnemonics! Could it be that your account is not activated? Are you using the correct network?"
      );
    } catch (err) {
      console.log("Error", err);
    }

    const sshIsValid = activeProfile.sshKey !== "";
    invalid = invalid || !sshIsValid;
    _updateError("sshKey", sshIsValid, "Invalid SSH Key");

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
</script>

<div class="profile-menu" on:click|stopPropagation={() => (opened = !opened)}>
  <button type="button">
    <span class="icon is-small">
      <i class="fas fa-user-cog" />
    </span>
  </button>
  {#if currentProfile}
    <div class="profile-active">
      <p>{currentProfile.name}</p>
      {#if balanceStore.loading}
        <p>Loading Account Balance</p>
      {:else if balanceStore.balance !== null}
        <p>Balance: <span>{balanceStore.balance}</span> TFT</p>
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
        <p>
          <a
            target="_blank"
            href="https://library.threefold.me/info/manual/#/manual__weblets_profile_manager"
          >
            Quick start documentation</a
          >
        </p>

        {#if configured}
          <div>
            <button
              class="button is-primary is-outlined mr-2"
              type="button"
              on:click={() => {
                selectedIdx = configs.addProfile();
                fields.forEach((_, i) => (fields[i].error = null));
              }}
            >
              + Add Profile
            </button>
            <button
              class="button is-primary mr-2"
              type="button"
              on:click={onEventHandler.bind(undefined, "save")}
            >
              Save
            </button>
            <button
              class="button is-danger"
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
            class={"button is-success" + (activating ? " is-loading" : "")}
            disabled={activating || activeProfileId === activeProfile?.id}
            on:click={onActiveProfile}
          >
            {activeProfileId === activeProfile?.id ? "Active" : "Activate"}
          </button>
        </div>

        {#if activeProfile}
          {#each fields as field (field.symbol)}
            <Input
              bind:data={activeProfile[field.symbol]}
              field={{
                ...field,
                disabled: activeProfileId === activeProfile.id,
              }}
            />
            {#if activeProfileId === activeProfile?.id}
              {#if field.symbol === "mnemonics"}
                <Input data={$configs.twinId} field={twinField} />
                <Input data={$configs.address} field={addressField} />
              {/if}
            {/if}
          {/each}
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
              class="button is-primary"
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

  .profile-menu {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: white;
    border-radius: 50px;
    border: 1px solid #ddd8d8;
    cursor: pointer;

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
