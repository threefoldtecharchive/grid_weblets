<svelte:options tag="tf-select-node-id" />

<script lang="ts">
  import type { IFormField, ISelectOption } from "../types";
  import type { IProfile } from "../types/Profile";
  import findNodes from "../utils/findNodes";
  import fetchFarmAndCountries from "../utils/fetchFarmAndCountries";

  // components
  import Input from "./Input.svelte";
  import nodeExists from "../utils/nodeExists";
  import validateNode from "../utils/validateNode";
  import type { FilterOptions } from "grid3_client";

  export let cpu: number;
  export let memory: number;
  export let ssd: number;
  export let publicIp: boolean;
  export let error: string = null;
  export let data: number;

  export let profile: IProfile;
  let loadingNodes: boolean = false;
  let manualNodeError: string = "";
  let manualNodeInfo: string = "";

  function setInfoError(info = "", error = "") {
    manualNodeInfo = info;
    manualNodeError = error;
  }
  $: {
    if (!data) {
      setInfoError("", "Please select a node");
    } else {
      setInfoError(`Checking if node ${data} exists`, "");
      profile &&
        data &&
        nodeExists(profile, data).then((exists) => {
          if (exists) {
            setInfoError(`Node ${data} exists`, "");
            validateNode(profile, cpu, memory, ssd, publicIp, data)
              .then((errmsg) => setInfoError("", errmsg))
              .catch((err) => setInfoError("", err));
          } else {
            setInfoError("", `Node ${data} does not exist`);
          }
        });
    }
  }
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
      { label: "Capacity filter", value: "automatic" },
      { label: "Manual", value: "manual" }
    ]
  };
  export let nodeSelection: string;

  export let filters: any;

  $: {
    if (filters) {
      if (cpu) filters.update("cru", cpu);
      if (memory) filters.update("mru", Math.round(memory / 1024));
      if (ssd) filters.update("sru", ssd);
      filters.update("publicIPs", publicIp);
    }
  }

  function onLoadNodesHandler() {
    loadingNodes = true;
    const label = nodeIdSelectField.options[0].label;
    nodeIdSelectField.options[0].label = "Loading...";

    findNodes(
      {
        publicIPs: filters.publicIPs,
        country: filters.country,
        farmName: filters.farmName,
        cru: filters.cru,
        mru: filters.mru,
        sru: filters.sru,
      },
      profile
    )
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

  function _update(key: string) {
    return (e: { detail: Event }) => {
      const inp = e.detail.target as HTMLInputElement;
      filters.update(key, inp.value);
    };
  }
</script>

<Input bind:data={nodeSelection} field={nodeSelectionField} />
{#if nodeSelection === "automatic"}
  <h5 class="is-size-5 has-text-weight-bold">Nodes Filter</h5>
  {#each filtersFields as field (field.symbol)}
    <Input
      data={filters[field.symbol]}
      {field}
      on:input={_update(field.symbol)}
    />
  {/each}

  <button
    class={"button is-primary mt-2 " + (loadingNodes ? "is-loading" : "")}
    disabled={loadingNodes}
    type="button"
    on:click={onLoadNodesHandler}
  >
    Apply filters and suggest nodes
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
  {#if manualNodeInfo}
    <p class="help is-success">{manualNodeInfo}</p>
  {/if}
  {#if manualNodeError}
    <p class="help is-danger">{manualNodeError}</p>
  {/if}
{/if}
