<svelte:options tag="tf-base" />

<script lang="ts">
  import { onMount } from "svelte";

  import baseConfigStore from "../../stores/baseConfig";
  import deploymentStore from "../../stores/deploymentStore";

  window.configs = window.configs || ({} as any);
  window.configs.baseConfig = baseConfigStore;
  window.configs.deploymentStore = deploymentStore;

  let _index = 0;
  onMount(() => {
    /* Make sure to find better solution */
    const define = customElements.define.bind(customElements);
    customElements.define = (name: string, cmp: any) => {
      try {
        return define(name, cmp);
      } catch {
        return define(name + _index++, cmp);
      }
    };
  });
</script>
