<svelte:options tag="tf-select-node-id" />

<script lang="ts">
  import type { IFormField } from "../types";
  import type { IProfile } from "../types/Profile";
  import findNodes from "../utils/findNodes";
  import Input from "./Input.svelte";

  // prettier-ignore
  const filtersFields: IFormField[] = [
    { label: "Access Node V4 Filter", symbol: "accessNodeV4", type: "checkbox" },
    { label: "Access Node V6 Filter", symbol: "accessNodeV6", type: "checkbox" },
    { label: "Gateway Filter", symbol: "gateway", type: "checkbox" },
    { label: "City Filter", symbol: "city", type: "text" },
    { label: "Country Filter", symbol: "country", type: "text" },
    { label: "Farm ID Filter", symbol: "farmId", type: "number" },
    { label: "CRU Filter", symbol: "cru", type: "number" },
    { label: "HRU Filter", symbol: "hru", type: "number" },
    { label: "MRU Filter", symbol: "mru", type: "number" },
    { label: "SRU Filter", symbol: "sru", type: "number" },
  ];

  // prettier-ignore
  const nodeIdSelectField: IFormField = { 
    label: "Node ID", 
    type: "select",
    symbol: "nodeId",
    options: [
      { label: "Please select a node id.", value: null, selected: true, disabled: true },
    ]
  };

  // prettier-ignore
  let nodeSelectionField: IFormField = {
    label: "Node Selection",
    type: "select",
    symbol: "value",
    options: [
      { label: "Choose a way to select node", value: null, selected: true, disabled: true },
      { label: "Automatic", value: "automatic" },
      { label: "Manual", value: "manual" }
    ]
  };
  let nodeSelection: string = null;
  const nodeIdField: IFormField = { label: "Node ID", symbol: "nodeId", type: "number", placeholder: "Your Node ID" }; // prettier-ignore

  const nodeFilters = {
    accessNodeV4: false,
    accessNodeV6: true,
    gateway: false,
    city: "",
    country: "",
    farmId: null,
    cru: null,
    hru: null,
    mru: null,
    sru: null,
  };
  export let profile: IProfile;
  let loadingNodes: boolean = false;

  function onLoadNodesHandler() {
    loadingNodes = true;
    findNodes(nodeFilters, profile)
      .then((_nodes) => {
        const [option] = nodeIdSelectField.options;
        _nodes.unshift(option);
        nodeIdSelectField.options = _nodes;
      })
      .finally(() => (loadingNodes = false));
  }

  export let data: number;
</script>

<Input bind:data={nodeSelection} field={nodeSelectionField} />
{#if nodeSelection === "automatic"}
  <h5 class="is-size-3 has-text-weight-bold">Nodes Filter</h5>
  {#each filtersFields as field (field.symbol)}
    <Input bind:data={nodeFilters[field.symbol]} {field} />
  {/each}
  <button
    class={"button is-primary mt-2 " + (loadingNodes ? "is-loading" : "")}
    disabled={loadingNodes}
    type="button"
    on:click={onLoadNodesHandler}
  >
    Apply Filters
  </button>

  <Input bind:data field={nodeIdSelectField} />
{:else if nodeSelection === "manual"}
  <Input bind:data field={nodeIdField} />
{/if}
