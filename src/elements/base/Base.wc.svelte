<svelte:options tag={null} />

<script lang="ts">
  import baseConfigStore from "../../stores/baseConfig";

  window.configs = window.configs || ({} as any);
  window.configs.baseConfig = baseConfigStore;
</script>
