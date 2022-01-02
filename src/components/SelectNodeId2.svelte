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

  // Limit updates
  let _update = true;
  let _info: IData = {
    cpu: null,
    memory: null,
    ssd: null,
    publicIp: null,
  };

  $: {
    // Check if should update
    if (data && nodeSelection)
      _update =
        _info.cpu !== data.cpu ||
        _info.memory !== data.memory ||
        _info.ssd !== data.ssd ||
        _info.publicIp !== data.publicIp;

    if (data && nodeSelection && _update && !loading) {
      // return to initial values
      _info = {
        cpu: data.cpu,
        memory: data.memory,
        ssd: data.ssd,
        publicIp: data.publicIp,
      };
      _update = false;

      // Code to exec
      const _nodeId = nodeId;
      loading = true;
      nodeId = null;

      const { cpu, memory, ssd, publicIp } = data;
      const filters = { sru: ssd, cru: cpu, mru: memory / 1024, publicIPs: publicIp }; // prettier-ignore

      loadNodes(filters)
        .then((nodes) => {
          nodeSelection.update("nodes", nodes);

          if (_nodeId === null && nodes.length > 0) {
            nodeId = +nodes[0].value;
          } else if (nodes.some((n) => n.value === _nodeId)) {
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
{/if}
