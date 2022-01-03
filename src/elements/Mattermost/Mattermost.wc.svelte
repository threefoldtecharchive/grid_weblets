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

  const data = new Mattermost();
  const validator = (x: string) => x.trim().length === 0 ? "Value can't be empty." : null; // prettier-ignore

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Username", symbol: "username", type: "text", placeholder: "Mattermost Username", validator },
    { label: "Password", symbol: "password", type: "password", placeholder: "Database & Mattermost Password", validator },
    { label: "Database Username", symbol: "dbUsername", type: "text", placeholder: "Database Username", validator }
  ];

  let profile: IProfile;
  let loading: boolean = false;
  let failed: boolean = false;
  let success: boolean = false;
  let message: string;
  $: disabled = data.invalid;

  function onDeployMattermost() {
    loading = true;
  }
</script>

<SelectProfile on:profile={({ detail }) => (profile = detail)} />

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={onDeployMattermost}>
    <h4 class="is-size-4">Deploy Mattermost</h4>
    <hr />

    <!--  || (logs !== null && logs.type === "Kubernetes") -->
    {#if loading}
      <!-- message={logs?.message ?? "Loading..."} -->
      <Alert type="info" message={"Loading..."} />
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
