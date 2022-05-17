<svelte:options tag="tf-alert" />

<script lang="ts">
  export let type: "info" | "success" | "danger" | "warning";
  export let message: string;
  export let deployed: Boolean = false;

  function selectColor(t: typeof type): string {
    switch (t) {
      case "info":
        return "#1982b1";
      default:
        return "white";
    }
  }
</script>

<div
  class={"notification"}
  style={`background-color: ${selectColor(type)}; color: white`}
>
  {@html message}
</div>
{#if deployed}
  <div class="notification is-info">
    Your solution is now starting. Please be patient
  </div>
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
