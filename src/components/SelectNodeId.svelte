<svelte:options tag="tf-select-node-id" />

<script lang="ts">
  import type { IFormField, ISelectOption } from "../types";
  import type { IProfile } from "../types/Profile";
  import findNodes from "../utils/findNodes";
  import gqlApi from "../utils/gqlApi";

  // components
  import Input from "./Input.svelte";

  export let cpu: number;
  export let memory: number;
  export let ssd: number;

  // prettier-ignore
  const filtersFields: IFormField[] = [
    { label: "Farm Name", symbol: "farmName", type: "select", placeholder: "Enter farm name", options: [
      { label: "Please select a farm", value: null, selected: true, disabled: true }
    ] },
    { label: "Country", symbol: "country", type: "text", placeholder: "Enter a country name" },
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
  const nodeIdField: IFormField = { label: "Node ID", symbol: "nodeId", type: "number", placeholder: "Your Node ID" }; // prettier-ignore

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
    if (memory) nodeFilters.mru = Math.floor(memory/1000);
    if (ssd) nodeFilters.sru = ssd;
  }

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

  const farmsConnection = `
    {
      farmsConnection {
        limit: totalCount
      }
    }
`;
  const getFarmsName = `
    query getFarmsName($limit: Int!) {
      farms(limit: $limit) {
        name
      }
    }
`;

  let _network: string;
  $: {
    if (
      nodeSelection === "automatic" &&
      profile &&
      profile.networkEnv !== _network
    ) {
      const label = filtersFields[0].options[0].label;
      filtersFields[0].options[0].label = "Loading...";
      _network = profile.networkEnv;
      gqlApi(profile, "farmsConnection", farmsConnection)
        .then<{ name: string }[]>((vars) => {
          console.log({ vars });

          return gqlApi(profile, "farms", getFarmsName, vars);
        })
        .then((farms) => {
          console.log({ farms });

          const [option] = filtersFields[0].options;
          const res = farms.map(({ name }) => {
            return { label: name, value: name } as ISelectOption;
          });
          res.unshift(option);
          option.label = label;
          filtersFields[0].options = res;
        })
        .catch((err) => {
          console.log("Error", err);
        });
    }
  }
</script>

<Input bind:data={nodeSelection} field={nodeSelectionField} />
{#if nodeSelection === "automatic"}
  <h5 class="is-size-7 has-text-weight-bold">Nodes Filter</h5>
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
