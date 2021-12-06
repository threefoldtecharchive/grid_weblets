<svelte:options tag="tf-deploy-btn" />

<script lang="ts">
  const currentDeployment = window.configs?.currentDeploymentStore;

  export let loading: boolean;
  export let success: boolean;
  export let failed: boolean;
  export let disabled: boolean;

  $: deployment = $currentDeployment;

  $: {
    console.log(deployment);
  }
</script>

<div class="is-flex is-justify-content-space-between is-align-items-center">
  <div style="width: 100%; padding-right: 15px;">
    {#if loading}
      <div class="notification is-warning">
        <strong>Warning!</strong> if you want to follow the progress of your deployment,
        don't leave this page.
      </div>
    {:else if deployment}
      <div class="notification is-warning">
        <strong>Warning!</strong> Another deployment of type
        <strong>{deployment.type}</strong>
        with name <strong>{deployment.name}</strong> is in-progress.
      </div>
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
