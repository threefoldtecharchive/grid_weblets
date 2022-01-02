<svelte:options tag="tf-select-nodeid" />

<script lang="ts">
  import type SelectNodeID from "../types/selectNodeId";

  import Input from "./Input.svelte";

  interface IData {
    cpu: number;
    memory: number;
    ssd: number;
    publicIp: boolean;
  }

  export let nodeSelection: SelectNodeID;
  export let nodeId: number;
  export let data: IData;
  let loading: boolean = false;

  function onSelectNodeId(e: Event) {
    const { selectedIndex } = e.target as HTMLSelectElement;
    const _nodeId = nodeSelection.nodes[selectedIndex - 1];
    console.log({ nodeId: _nodeId });
    nodeId = +_nodeId.value;
  }

  $: {
  }
</script>

{#if nodeSelection}
  <div>
    <h5 class="is-size-5 has-text-weight-bold">Nodes Filter</h5>

    <Input
      data={nodeSelection.filters.farmName}
      field={{
        label: "Farm Name",
        symbol: "farmName",
        type: "select",
        options: [
          {
            label: loading ? "Loading..." : "Select farm name",
            value: null,
            disabled: true,
          },
          ...nodeSelection.farmNames,
        ],
      }}
    />

    <Input
      data={nodeSelection.filters.country}
      field={{
        label: "Country",
        symbol: "country",
        type: "select",
        options: [
          {
            label: loading ? "Loading..." : "Select country",
            value: null,
            disabled: true,
          },
          ...nodeSelection.countries,
        ],
      }}
    />

    <Input
      bind:data={nodeId}
      field={{
        label: `Node ID (Found ${nodeSelection.nodes.length})`,
        symbol: "nodeId",
        type: "select",
        options: [
          {
            label: loading ? "Loading..." : "Select NodeId",
            value: null,
            disabled: true,
          },
          ...nodeSelection.nodes,
        ],
      }}
      on:input={({ detail }) => onSelectNodeId(detail)}
    />
  </div>
{/if}
