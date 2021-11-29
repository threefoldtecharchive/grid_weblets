<svelte:options tag="tf-profiles" />

<script lang="ts">
  import type { IFormField, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";
  import validateMnemonics from "../../utils/validateMnemonics";

  // Components
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import Alert from "../../components/Alert.svelte";

  const configs = window.configs?.baseConfig;
  let active = "0";
  let password: string = "";
  let configured: boolean = false;

  let profiles: IProfile[];
  let activeProfile: IProfile;
  let activeProfileId: string;
  let opened: boolean = false;

  let tabs: ITab[] = [];
  let _init: boolean = false;
  $: {
    let s = $configs;
    if (s) {
      if (!_init && s.loaded) {
        _init = true;
        configured = true;
      }
      profiles = s.profiles;
      activeProfile = profiles[active];
      activeProfileId = s.activeProfile;
      tabs = profiles.map((profile, i) => {
        return { label: profile.name || `Profile ${i + 1}`, value: i.toString(), removable: i !== 0 }; // prettier-ignore
      });
    }
  }

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Profile Name", symbol: "name", placeholder: "Profile name", type: "text" },
    { label: "Network Environment", symbol: "networkEnv", type: "select", options: [
      { label: "Testnet", value: "test" },
      { label: "Devnet", value: "dev" }
    ] },
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Enter your mnemonics", type: "password" },
    { label: "TFChain Configurations Secret", symbol: "storeSecret", placeholder: "Secret key used to encrypt your data on TFChain", type: "password" },
    { label: "Public SSH Key", symbol: "sshKey", placeholder: "Your public SSH key, will be added as default to all deployments.", type: "text" },
  ]
  const secretField: IFormField = { label: "Browser Session Secret", type: "password", placeholder: "Browser Session Secret", symbol: "secret", tooltip: "Browser Session Secret" }; // prettier-ignore

  let message: string;
  function onEventHandler(event: "create" | "load" | "save") {
    message = configs[event](password);
    if (!message) {
      configured = true;
    }
  }

  let activating: boolean = false;
  function onActiveProfile() {
    activating = true;
    let invalid = false;
    validateMnemonics(activeProfile)
      .then((valid) => {
        console.log("Valid Mnemonics", valid);
        invalid = invalid || !valid;
        fields[2].error = valid ? null : "Invalid Mnemonics";
        return activeProfile.storeSecret !== "";
      })
      .then((valid) => {
        console.log("Valid storeSecret", valid);
        invalid = invalid || !valid;
        fields[3].error = valid ? null : "Invalid storeSecret";
        return activeProfile.sshKey !== "";
      })
      .then((valid) => {
        console.log("Valid sshKey", valid);
        invalid = invalid || !valid;
        fields[4].error = valid ? null : "Invalid SSH Key";
        return !invalid;
      })
      .then((valid) => {
        if (valid) {
          configs.setActiveProfile(activeProfile.id);
        }
      })
      .finally(() => {
        activating = false;
      });
  }
</script>

<section
  class="profile-container"
  style={`transform: translateX(${opened ? "0" : "calc(100% - 50px)"})`}
>
  <div class="box">
    <div
      style="display: flex; justify-content: space-between; align-items: center;"
    >
      <h4 class="is-size-4">Profile Manager</h4>

      {#if configured}
        <div>
          <button
            class="button is-primary is-outlined mr-2"
            type="button"
            on:click={configs.addProfile}
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
            }}
          >
            Back
          </button>
        </div>
      {/if}
    </div>

    <p class="mt-4">
      Please visit <a
        href="https://library.threefold.me/info/threefold"
        target="_blank"
      >
        the manual
      </a>
      to <strong>get started.</strong>
    </p>
    <hr />

    {#if configured}
      <Tabs
        bind:active
        {tabs}
        centered={false}
        on:removed={({ detail }) => configs.deleteProfile(detail)}
        on:select={() => [2, 3, 4].forEach((i) => (fields[i].error = null))}
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
        {/each}
      {/if}
    {:else}
      <form on:submit|preventDefault={onEventHandler.bind(undefined, "load")}>
        <Input bind:data={password} field={secretField} />

        {#if message}
          <Alert type="danger" {message} />
        {/if}

        <div style="display: flex; justify-content: center;">
          <button
            class="button is-primary mr-2"
            type="submit"
            disabled={password === ""}
          >
            Unlock Store
          </button>

          <button
            class="button is-primary is-outlined"
            type="button"
            disabled={password === ""}
            on:click={onEventHandler.bind(undefined, "create")}
          >
            Create a New Store
          </button>
        </div>
      </form>
    {/if}
  </div>
  <button
    class={"profile-toggle" + (opened ? " active" : "")}
    on:click={() => (opened = !opened)}
  >
    <span />
    <span />
    <span />
  </button>
</section>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .profile-container {
    position: fixed;
    top: 25px;
    right: 0;
    width: calc(100% - 150px);
    padding: 15px;
    max-height: 90vh;
    overflow-x: hidden;
    overflow-y: auto;
    transition: transform 0.35s ease;
    z-index: 9999;
    padding-left: 50px;
  }

  .profile-toggle {
    z-index: 9;
    position: absolute;
    top: 25px;
    left: 0;
    height: 50px;
    width: 50px;
    cursor: pointer;
    border: none;
    background-color: rgb(250, 250, 250);

    > span {
      position: absolute;
      height: 5px;
      width: 40px;
      left: 5px;
      top: 8px;
      background-color: #555;
      transition-property: opacity, transform, top;
      transition-duration: 0.35s;
      transition-timing-function: ease;

      &:nth-of-type(2) {
        top: 22px;
        transform: rotate(0) !important;
      }

      &:nth-of-type(3) {
        top: 36px;
      }
    }

    &.active {
      > span {
        transform: rotate(45deg);
        top: 22px;

        &:nth-of-type(2) {
          opacity: 0;
        }

        &:nth-of-type(3) {
          top: 22px;
          transform: rotate(-45deg);
        }
      }
    }
  }
</style>
