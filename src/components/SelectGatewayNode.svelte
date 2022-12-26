<svelte:options tag="tf-select-gateway-node" />

<script lang="ts">
  import { onMount } from "svelte";
  import { LoadGatewayNodes, GatewayNodes } from "../utils/gatewayHelpers";
  import Input from "./Input.svelte";

  let gateways: GatewayNodes[] = [];
  export let gateway: GatewayNodes;
  export let invalid = true;
  let loading = true;

  async function init() {
    LoadGatewayNodes()
      .then(_gateways => {
        gateways = _gateways.map((gw, idx) => ({ ...gw, idx }));
        loading = false;
        invalid = true;
      })
      .catch(() => requestAnimationFrame(init));
  }

  onMount(init);

  let data = null;

  $: {
    if (data === null && gateway) {
      data = gateway.idx;
      invalid = false;
    } else if (data !== null && gateways) {
      gateway = gateways[data];
      invalid = false;
    }
  }
</script>

<Input
  field={{
    type: "select",
    symbol: "gateway-selector",
    label: "Select Gateway Node",
    invalid: true,
    options: [
      {
        label: loading ? "Loading gateways..." : "Please select a domain.",
        value: null,
        selected: true,
        disabled: true,
      },
      ...gateways.map(({ nodeDomain }, i) => ({ label: nodeDomain, value: i })),
    ],
  }}
  bind:data
  on:input={() => (invalid = false)}
/>
