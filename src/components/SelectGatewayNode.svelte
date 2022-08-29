<svelte:options tag="tf-select-gateway-node" />
<script lang="ts">
import { onMount } from 'svelte';
import { LoadGatewayNodes, GatewayNodes } from '../utils/gatewayHelpers';
import Input from './Input.svelte';

let gateways: GatewayNodes[] = []
export let gateway: GatewayNodes;
let loading = true;

onMount(async () => {
    gateways = await LoadGatewayNodes()
    loading = false;

});

let data = null;
export let invalid = true;

$: gateway = data === null ? null : gateways[data]
</script>

<Input 
    field={{
        type: 'select',
        symbol: 'gateway-selector',
        label: 'Select Gateway Node',
        invalid: true,
        options: [
            { label: loading ? "Loading gateways..." : "Please select a domain.", value: null, selected: true, disabled: true },
            ...gateways.map(({ nodeDomain }, i) => ({ label: nodeDomain, value: i }))
        ]
    }}    
    bind:data
    on:input={() => invalid = false}
/>