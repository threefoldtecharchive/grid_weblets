<svelte:options tag="tf-mattermost" />

<script lang="ts">
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Input from "../../components/Input.svelte";
  import SelectProfile from "../../components/SelectProfile.svelte";
  import type { IFormField } from "../../types";
  import type { IProfile } from "../../types/Profile";

  import Mattermost from "../../types/mattermost";
  import Alert from "../../components/Alert.svelte";
  import { noActiveProfile } from "../../utils/message";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import deployMattermost from "../../utils/deployMattermost";

  const currentDeployment = window.configs?.currentDeploymentStore;
  const data = new Mattermost();
  const validator = (x: string) => x.trim().length === 0 ? "Value can't be empty." : null; // prettier-ignore

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Name", symbol: "name", type: "text", placeholder: "Mattermost name", validator },
    { label: "Username", symbol: "username", type: "text", placeholder: "Mattermost Username", validator },
    { label: "Password", symbol: "password", type: "password", placeholder: "Database & Mattermost Password", validator },
    { label: "Domain", symbol: "domain", type: "text", placeholder: "Site Url", validator },
    { label: "SMTP Server", symbol: "server", type: "text", placeholder: "SMTP server", validator },
    { label: "SMTP port", symbol: "port", type: "text", placeholder: "SMTP port", validator },
  ];

  let profile: IProfile;
  let loading: boolean = false;
  let failed: boolean = false;
  let success: boolean = false;
  let message: string;
  $: disabled = data.invalid || data.status !== "valid";

  function onDeployMattermost() {
    loading = true;
    deployMattermost(profile, data)
      .then((res) => {
        console.log(res);
        success = true;
      })
      .catch((err) => {
        console.log("Error", err);
        failed = true;
        message = err.message || err;
      })
      .finally(() => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;
</script>

<SelectProfile on:profile={({ detail }) => (profile = detail)} />

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={onDeployMattermost}>
    <h4 class="is-size-4">Deploy Mattermost</h4>
    <hr />

    {#if loading || (logs !== null && logs.type === "VM")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully deployed Mattermost."
        deployed={true}
      />
    {:else if failed}
      <Alert
        type="danger"
        message={message || "Failed to deploy Mattermost."}
      />
    {:else}
      {#each fields as field (field.symbol)}
        <Input bind:data={data[field.symbol]} {field} />
      {/each}

      <SelectNodeId
        bind:data={data.nodeId}
        bind:status={data.status}
        bind:nodeSelection={data.selection.type}
        {profile}
        cpu={2}
        ssd={10}
        memory={2048}
        publicIp={true}
        nodes={data.selection.nodes}
        filters={data.selection.filters}
        on:fetch={({ detail }) => (data.selection.nodes = detail)}
      />
    {/if}

    <DeployBtn
      {disabled}
      {loading}
      {failed}
      {success}
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
