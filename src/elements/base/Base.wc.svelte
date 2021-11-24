<svelte:options tag="tf-base" />

<script lang="ts">
  import { onMount } from "svelte";
  import { v4 } from "uuid";

  import baseConfigStore from "../../stores/baseConfig";
  import deploymentStore from "../../stores/deploymentStore";

  window.configs = window.configs || ({} as any);
  window.configs.baseConfig = baseConfigStore;
  window.configs.deploymentStore = deploymentStore;

  onMount(() => {
    /* Make sure to find better solution */
    const define = customElements.define.bind(customElements);
    customElements.define = (name: string, cmp: any) => {
      try {
        return define(name, cmp);
      } catch {
        return define(name + v4(), cmp);
      }
    };
  });
</script>
