<svelte:options tag={null} />

<script lang="ts">
  import baseConfigStore from "../../stores/baseConfig";
  import deploymentStore from "../../stores/deploymentStore";

  window.configs = window.configs || ({} as any);
  window.configs.baseConfig = baseConfigStore;
  window.configs.deploymentStore = deploymentStore;
</script>
