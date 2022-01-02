<svelte:options tag="tf-select-nodeid" />

<script lang="ts">
  import type SelectNodeID from "../types/selectNodeId";
  import loadNodes from "../utils/loadNodes";

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

  $: {
    if (data && nodeSelection) {
      loading = true;
      const _nodeId = nodeId;
      nodeId = null;

      const { cpu, memory, ssd, publicIp } = data;
      const { country, farmName } = nodeSelection.filters;
      const filters = { sru: ssd, cru: cpu, mru: memory / 1024, publicIPs: publicIp, farmName, country }; // prettier-ignore
      console.log({ filters });

      loadNodes(filters)
        .then((info) => {
          const { countries, nodes, farmNames } = info;
          nodeSelection.update("countries", countries);
          nodeSelection.update("nodes", nodes);
          nodeSelection.update("farmNames", farmNames);

          if (nodes.some((n) => n.value === _nodeId)) {
            nodeId = _nodeId;
          }
        })
        .catch((err) => {
          console.log("Error", err);
        })
        .finally(() => {
          loading = false;
        });
    }
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
      on:input={({ detail }) => {
        const { selectedIndex } = detail.target;
        const farmName = nodeSelection.farmNames[selectedIndex - 1];
        nodeSelection.updateFilter("farmName", farmName.value.toString());
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
      on:input={({ detail }) => {
        const { selectedIndex } = detail.target;
        const country = nodeSelection.countries[selectedIndex - 1];
        nodeSelection.updateFilter("country", country.value.toString());
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
      on:input={({ detail }) => {
        const { selectedIndex } = detail.target;
        const _nodeId = nodeSelection.nodes[selectedIndex - 1];
        nodeId = +_nodeId.value;
      }}
    />
  </div>
{/if}
