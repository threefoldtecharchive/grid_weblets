<svelte:options tag="tf-deploy-btn" />

<script lang="ts">
  export let loading: boolean;
  export let success: boolean;
  export let failed: boolean;
  export let disabled: boolean;
</script>

<div class="is-flex is-justify-content-flex-end is-align-items-center">
  <button
    class={"button is-primary " + (loading ? "is-loading" : "")}
    type="submit"
    {disabled}
    on:click
  >
    {#if success || failed}
      Back
    {:else}
      Deploy
    {/if}
  </button>
</div>
