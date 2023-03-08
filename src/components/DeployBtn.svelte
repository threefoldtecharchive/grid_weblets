<svelte:options tag="tf-deploy-btn" />

<script lang="ts">
  const currentDeployment = window.configs?.currentDeploymentStore;

  export let loading: boolean;
  export let success: boolean;
  export let failed: boolean;
  export let disabled: boolean;
  export let label = "Deploy";
  $: deployment = $currentDeployment;
</script>

<div class="is-flex is-justify-content-space-between is-align-items-center">
  <div style="width: 100%; padding-right: 15px;">
    {#if loading}
      <div class="notification is-warning is-light">Make sure not to leave the page if an action is in progress.</div>
    {:else if deployment}
      <div class="notification is-warning is-light">
        There is another action in progress: <strong>{deployment.type} {deployment.name}</strong>
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
