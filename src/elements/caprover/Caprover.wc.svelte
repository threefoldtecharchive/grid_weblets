<svelte:options tag="tf-caprover" />

<script lang="ts">
  import type { IFormField, ITab } from "../../types";
  import { default as Caprover } from "../../types/caprover";
  import deployCaprover from "../../utils/deployCaprover";
  const { events } = window.configs?.grid3_client ?? {};
  import type { IProfile } from "../../types/Profile";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";

  const data = new Caprover();
  let loading = false;
  let success = false;
  let failed = false;
  const deploymentStore = window.configs?.deploymentStore;
  let profile: IProfile;
  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || profile.mnemonics === "" || profile.storeSecret === ""; // prettier-ignore

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Config", value: "config" },
  ];
  let active = "config";

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "CapRover instance name", type: "text" },
    { label: "CPU", symbol: "cpu", placeholder: "CPU", type: "number" },
    { label: "Memory (MB)", symbol: 'memory', placeholder: "Memory in MB", type: "number" },
    { label: "Disk Size (GB)", symbol: "diskSize", placeholder: "Disk size in GB", type: "number" },
    { label: "Domain", symbol: "domain", placeholder: "domain configured in your name provider.", type: "text" },
    // { label: "Public Key", symbol: "publicKey", placeholder: "Your Public Key", type: "text" },
    // { label: "Node ID", symbol: "nodeId", placeholder: "Node Id", type: "number" },

  ];

  let message: string;
  function deployCaproverHandler() {
    loading = true;
    success = false;
    failed = false;
    message = undefined;

    function onLogInfo(msg: string) {
      if (typeof msg === "string") {
        message = msg;
      }
    }

    events.addListener("logs", onLogInfo);

    deployCaprover(data, profile)
      .then(() => {
        deploymentStore.set(0);
        success = true;
      })
      .catch((err: string) => {
        failed = true;
        message = err;
      })
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
  }
</script>

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={deployCaproverHandler}>
    <h4 class="is-size-4 mb-4">Caprover Deployer</h4>
    <hr />

    {#if loading}
      <div class="notification is-info">
        <Alert type="info" message={message || "Loading..."} />
      </div>
    {:else if success}
      <Alert type="success" message="Successfully deployed Caprover." />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy Caprover."} />
    {:else}
      <SelectProfile
        on:profile={({ detail }) => {
          profile = detail;
          data.publicKey = detail.sshKey;
        }}
      />
      <Tabs bind:active {tabs} />

      {#if active === "config"}
        {#each fields as field (field.symbol)}
          <Input bind:data={data[field.symbol]} {field} />
        {/each}
        <SelectNodeId bind:data={data.nodeId} {profile} />
      {/if}
    {/if}

    <DeployBtn
      {disabled}
      {loading}
      {success}
      {failed}
      on:click={(e) => {
        if (success || failed) {
          e.preventDefault();
          success = false;
          failed = false;
          loading = false;
        }
      }}
    />
  </form>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
