<svelte:options tag="tf-deploy-btn" />

<script lang="ts">
  const currentDeployment = window.configs?.currentDeploymentStore;

  export let loading: boolean;
  export let success: boolean;
  export let failed: boolean;
  export let disabled: boolean;
  export let label: string = "Deploy";
  $: deployment = $currentDeployment;
</script>

<div class="is-flex is-justify-content-space-between is-align-items-center">
  <div style="width: 100%; padding-right: 15px;">
    {#if loading}
      <div class="notification is-warning is-light">
        <strong>Warning!</strong> Make sure to not leave the page if there is an
        in-progress deployment or deletion.
      </div>
    {:else if deployment}
      <div class="notification is-warning is-light">
        <strong>Warning!</strong> Another deployment of type
        <strong>{deployment.type}</strong>
        with name <strong>{deployment.name}</strong> is in-progress.
      </div>
    {/if}
  </div>
  <button
    class={"button " + (loading ? "is-loading" : "")}
    style={`background-color: #1982b1; color: white`}
    type="submit"
    on:click
    disabled={disabled || !!deployment}
  >
    {#if success || failed}
      Back
    {:else}
      {label}
    {/if}
  </button>
</div>
