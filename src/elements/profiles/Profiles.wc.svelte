<svelte:options tag="tf-profiles" />

<script lang="ts">
  // Components
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import Alert from "../../components/Alert.svelte";
  import type { IFormField, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";

  const configs = window.configs?.baseConfig;
  let active = "0";
  let password: string = "";
  let configured: boolean = false;

  let profiles: IProfile[];
  let activeProfile: IProfile;

  let tabs: ITab[] = [];
  $: {
    profiles = $configs;
    activeProfile = profiles[active];
    tabs = profiles.map((profile, i) => {
      return { label: profile.name || `Profile ${i + 1}`, value: i.toString(), removable: i !== 0 }; // prettier-ignore
    });
  }

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Profile Name", symbol: "name", placeholder: "Profile name", type: "text" },
    { label: "Network Environment", symbol: "networkEnv", type: "select", options: [
      { label: "Testnet", value: "test" },
      { label: "Devnet", value: "dev" }
    ] },
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Enter your mnemonics", type: "text" },
    { label: "TFChain Configurations Secret", symbol: "storeSecret", placeholder: "Secret key used to encrypt your data on TFChain", type: "text" },
    { label: "Public SSH Key", symbol: "sshKey", placeholder: "Your public SSH key, will be added as default to all deployments.", type: "text" },
  ]
  const secretField: IFormField = { label: "Browser Session Secret", type: "password", placeholder: "Browser Session Secret", symbol: "secret" }; // prettier-ignore

  let message: string;
  function onEventHandler(event: "create" | "load" | "save") {
    message = configs[event](password);
    if (!message) {
      configured = true;
    }
  }
</script>

<section style="padding: 15px;">
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
            on:click={() => (configured = false)}
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
      />

      {#each fields as field (field.symbol)}
        <Input bind:data={activeProfile[field.symbol]} {field} />
      {/each}
    {:else}
      <Input bind:data={password} field={secretField} />

      {#if message}
        <Alert type="danger" {message} />
      {/if}

      <div style="display: flex; justify-content: center;">
        <button
          class="button is-primary is-outlined mr-2"
          type="button"
          disabled={password === ""}
          on:click={onEventHandler.bind(undefined, "load")}
        >
          Unlock Store
        </button>

        <button
          class="button is-primary"
          type="button"
          disabled={password === ""}
          on:click={onEventHandler.bind(undefined, "create")}
        >
          Create a New Store
        </button>
      </div>
    {/if}
  </div>
</section>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
