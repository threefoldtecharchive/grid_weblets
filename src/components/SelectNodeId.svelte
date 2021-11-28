<svelte:options tag="tf-select-node-id" />

<script lang="ts">
  import type { IFormField, ISelectOption } from "../types";
  import type { IProfile } from "../types/Profile";
  import findNodes from "../utils/findNodes";
  import fetchFarmAndCountries from "../utils/fetchFarmAndCountries";

  // components
  import Input from "./Input.svelte";

  export let cpu: number;
  export let memory: number;
  export let ssd: number;
  export let publicIp: boolean;
  export let error: string = null;

  // prettier-ignore
  const filtersFields: IFormField[] = [
    { label: "Farm Name", symbol: "farmName", type: "select", placeholder: "Enter farm name", options: [
      { label: "Please select a farm", value: null, selected: true }
    ] },
    { label: "Country", symbol: "country", type: "select", placeholder: "Enter a country name", options: [
      { label: "Please select a country", value: null, selected: true }
    ] },
    { label: "CPU (Cores)", symbol: "cru", type: "number", placeholder: "Enter CPU" },
    { label: "Memory (GB)", symbol: "mru", type: "number", placeholder: "Enter Memory" },
    { label: "SSD (GB)", symbol: "sru", type: "number", placeholder: "Enter SSD size" },
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

  const nodeFilters = {
    // boolean
    publicIPs: null, // -

    // string
    country: null,
    farmName: null, // *

    // number
    cru: null, // *
    mru: null, // *
    sru: null, // *
  };
  $: {
    if (cpu) nodeFilters.cru = cpu;
    if (memory) nodeFilters.mru = Math.round(memory / 1024);
    if (ssd) nodeFilters.sru = ssd;
    nodeFilters.publicIPs = publicIp;
  }

  export let profile: IProfile;
  let loadingNodes: boolean = false;

  function onLoadNodesHandler() {
    loadingNodes = true;
    const label = nodeIdSelectField.options[0].label;
    nodeIdSelectField.options[0].label = "Loading...";

    findNodes(nodeFilters, profile)
      .then((_nodes) => {
        nodeIdSelectField.options[0].label = label;
        const [option] = nodeIdSelectField.options;
        _nodes.unshift(option);
        nodeIdSelectField.options = _nodes;
      })
      .catch((err) => {
        console.log("Error", err);
      })
      .finally(() => {
        loadingNodes = false;
        nodeIdSelectField.options[0].label = label;
      });
  }

  export let data: number;

  function _setLabel(index: number, label: string = "Loading...") {
    const oldLabel = filtersFields[index].options[0].label;
    filtersFields[index].options[0].label = label;
    return oldLabel;
  }

  function _setOptions(
    index: number,
    items: Array<{ name: string; code?: string }>
  ) {
    const [option] = filtersFields[index].options;
    filtersFields[index].options = items.reduce(
      (res, { name, code }) => {
        const op = { label: name, value: code || name } as ISelectOption;
        res.push(op);
        return res;
      },
      [option]
    );
  }

  let _network: string;
  $: {
    if (
      nodeSelection === "automatic" &&
      profile &&
      profile.networkEnv !== _network
    ) {
      /* Cache last used network */
      _network = profile.networkEnv;

      /* Loading farms & countries */
      const farmsLabel = _setLabel(0);
      const countriesLabel = _setLabel(1);

      fetchFarmAndCountries(profile)
        .then(({ farms, countries }) => {
          _setOptions(0, farms);
          _setOptions(1, countries);
        })
        .catch((err) => {
          console.log("Error", err);
        })
        .finally(() => {
          _setLabel(0, farmsLabel);
          _setLabel(1, countriesLabel);
        });
    }
  }
</script>

<Input bind:data={nodeSelection} field={nodeSelectionField} />
{#if nodeSelection === "automatic"}
  <h5 class="is-size-5 has-text-weight-bold">Nodes Filter</h5>
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
  <Input
    bind:data
    field={{
      label: "Node ID",
      symbol: "nodeId",
      type: "number",
      placeholder: "Your Node ID",
      error,
    }}
  />
{/if}
