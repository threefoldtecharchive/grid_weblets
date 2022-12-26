<svelte:options tag="tf-alert" />

<script lang="ts">
  export let type: "info" | "success" | "danger" | "warning" | "gray";
  export let message: string;
  export let deployed = false;

  function selectColor(t: typeof type): string {
    switch (t) {
      case "info":
        return "#1982b1";
      case "danger":
        return "#FF5151";
      case "success":
        return "#1982b1";
      default:
        return "";
    }
  }

  setTimeout(() => {
    deployed = false;
  }, 120000);
</script>

{#if type == "gray"}
  <div class="notification" style={`background-color: transparent; color: #333`}>
    {@html message}
  </div>
{:else if type == "warning"}
  <div class="notification" style={`background-color: #fffaeb; color: #946c00`}>
    {@html message}
  </div>
{:else}
  <div class={"notification"} style={`background-color: ${selectColor(type)}; color: white`}>
    {@html message}
  </div>
{/if}

{#if deployed}
  <div class={"notification"} style={`background-color: ${selectColor(type)}; color: white`}>
    Your solution is now starting. Please be patient
  </div>
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
