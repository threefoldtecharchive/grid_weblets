<svelte:options tag="tf-select-gateway-node" />
<script lang="ts">
import { onMount } from 'svelte';
import { LoadGatewayNodes, GatewayNodes } from '../utils/gatewayHelpers';
import Input from './Input.svelte';

let gateways: GatewayNodes[] = []
export let gateway: GatewayNodes;
export let invalid = true;
let loading = true;

onMount(async () => {
    gateways = await LoadGatewayNodes()
    loading = false;
    invalid = true;
});

let data = null;

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