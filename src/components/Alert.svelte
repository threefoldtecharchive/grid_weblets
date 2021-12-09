<svelte:options tag="tf-alert" />

<script lang="ts">
  export let type: "info" | "success" | "danger";
  export let message: string;
  export let deployed: Boolean = false;
</script>

<div class={"notification is-" + type}>
  {message}
</div>
{#if deployed}
  <div class="notification is-info">
    Your solution is now starting. Please be patient
  </div>
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
