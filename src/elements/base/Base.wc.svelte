<svelte:options tag="tf-base" />

<script lang="ts">
  import { onMount } from "svelte";

  // libs
  import baseConfigStore from "../../stores/baseConfig";
  import deploymentStore from "../../stores/deploymentStore";
  import notificationStore from "../../stores/notifications";
  import currentDeploymentStore from "../../stores/currentDeployment";
  import LogsInfo from "../../components/LogsInfo.svelte";
  import balanceStore from "../../stores/balance";
import Disclaimer from "../disclaimer/Disclaimer.wc.svelte";

  window.configs = window.configs || ({} as any);
  window.configs.baseConfig = baseConfigStore;
  window.configs.deploymentStore = deploymentStore;
  window.configs.notificationStore = notificationStore;
  window.configs.currentDeploymentStore = currentDeploymentStore;
  window.configs.balanceStore = balanceStore;

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

<LogsInfo />
<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
