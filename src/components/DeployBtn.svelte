<svelte:options tag="tf-deploy-btn" />

<script lang="ts">
  import type { IProfile } from "../types/Profile";
  import { noActiveProfile } from "../utils/message";
  import Alert from "./Alert.svelte";

  const currentDeployment = window.configs?.currentDeploymentStore;

  export let loading: boolean;
  export let success: boolean;
  export let failed: boolean;
  export let disabled: boolean;
  export let profile: IProfile;

  $: deployment = $currentDeployment;
</script>

<div class="is-flex is-justify-content-space-between is-align-items-center">
  <div style="width: 100%; padding-right: 15px;">
    {#if loading}
      <div class="notification is-warning">
        <strong>Warning!</strong> Make sure to not leave the page if there is an
        in-progress deployment or deletion.
      </div>
    {:else if deployment}
      <div class="notification is-warning">
        <strong>Warning!</strong> Another deployment of type
        <strong>{deployment.type}</strong>
        with name <strong>{deployment.name}</strong> is in-progress.
      </div>
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {/if}
  </div>
  <button
    class={"button is-primary " + (loading ? "is-loading" : "")}
    type="submit"
    disabled={disabled || !!deployment}
    on:click
  >
    {#if success || failed}
      Back
    {:else}
      Deploy
    {/if}
  </button>
</div>
