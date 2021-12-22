<svelte:options tag="tf-select-node-id" />

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { IFormField, ISelectOption } from "../types";
  import type { IProfile } from "../types/Profile";
  import findNodes from "../utils/findNodes";

  // components
  import Input from "./Input.svelte";
  import gqlApi from "../utils/gqlApi";
  const { GridClient } = window.configs?.grid3_client ?? {};

  const dispatch = createEventDispatcher<{ fetch: ISelectOption[] }>();
  export let cpu: number;
  export let memory: number;
  export let ssd: number;
  export let publicIp: boolean;
  export let data: number;
  export let status: "valid" | "invalid";
  export let nodes: ISelectOption[] = [];
  // export let error: string = null;

  export let profile: IProfile;
  let loadingNodes: boolean = false;

  // prettier-ignore
  const filtersFields: IFormField[] = [
    { label: "Farm Name", symbol: "farmName", type: "select", placeholder: "Enter Farm Name", options: [
      { label: "Please select a farm", value: null, selected: true }
    ] },
    { label: "Country", symbol: "country", type: "select", placeholder: "Enter Country Name", options: [
      { label: "Please select a country", value: null, selected: true }
    ] },
  ];

  // prettier-ignore
  const nodeIdSelectField /* : IFormField */ = {
    options: [
      { label: "Please select a node id.", value: null, selected: true, disabled: true },
    ] as ISelectOption[]
  };

  // prettier-ignore
  let nodeSelectionField: IFormField = {
    label: "Node Selection",
    type: "select",
    symbol: "value",
    options: [
      { label: "Choose a way to select node", value: null, selected: true, disabled: true },
      { label: "Capacity Filter", value: "automatic" },
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

  function _setValues(symbol: string, values: ISelectOption[]) {
    const idx = filtersFields.findIndex((f) => f.symbol === symbol);
    const [option] = filtersFields[idx].options;
    values.unshift(option);
    filtersFields[idx].options = values;
  }

  function onLoadNodesHandler(filters?: any) {
    loadingNodes = true;
    const label = nodeIdSelectField.options[0].label;
    nodeIdSelectField.options[0].label = "Loading...";
    const _filters = filters || {
      publicIPs: filters.publicIPs,
      country: filters.country,
      farmName: filters.farmName,
      cru: filters.cru,
      mru: filters.mru,
      sru: filters.sru,
    };

    findNodes(_filters, profile)
      .then(({ nodes, farms, countries }) => {
        dispatch("fetch", nodes);
        _setValues("farmName", farms);
        _setValues("country", countries);

        if (nodes.length <= 0) {
          data = null;
          nodeIdSelectField.options[0].label = "No nodes available";
        } else {
          nodeIdSelectField.options[0].label = label;
        }
      })
      .catch((err) => {
        console.log("Error", err);
        data = null;
        nodeIdSelectField.options[0].label = "No nodes available";
      })
      .finally(() => {
        loadingNodes = false;
      });
  }

  $: {
    const [option] = nodeIdSelectField.options;
    if (nodes.length > 0) {
      data = +nodes[0].value;
    }
    nodeIdSelectField.options = [option, ...nodes];
  }

  // function _setLabel(index: number, label: string = "Loading...") {
  //   const oldLabel = filtersFields[index].options[0].label;
  //   filtersFields[index].options[0].label = label;
  //   return oldLabel;
  // }

  // function _setOptions(
  //   index: number,
  //   items: Array<{ name: string; code?: string }>
  // ) {
  //   const [option] = filtersFields[index].options;
  //   filtersFields[index].options = items.reduce(
  //     (res, { name, code }) => {
  //       const op = { label: name, value: code || name } as ISelectOption;
  //       res.push(op);
  //       return res;
  //     },
  //     [option]
  //   );
  // }

  // let _network: string;
  // $: {
  //   if (
  //     nodeSelection === "automatic" &&
  //     profile &&
  //     profile.networkEnv !== _network
  //   ) {
  //     /* Cache last used network */
  //     _network = profile.networkEnv;

  //     /* Loading farms & countries */
  //     const farmsLabel = _setLabel(0);
  //     const countriesLabel = _setLabel(1);

  //     fetchFarmAndCountries(profile)
  //       .then(({ farms, countries }) => {
  //         farms.sort((f0, f1) => f0.name.localeCompare(f1.name));
  //         _setOptions(0, farms);
  //         _setOptions(1, countries);
  //       })
  //       .catch((err) => {
  //         console.log("Error", err);
  //       })
  //       .finally(() => {
  //         _setLabel(0, farmsLabel);
  //         _setLabel(1, countriesLabel);
  //       });
  //   }
  // }

  function _update(key: string) {
    return (e: { detail: Event }) => {
      const inp = e.detail.target as HTMLInputElement;
      filters.update(key, inp.value);
    };
  }

  function _nodeValidator(value: number) {
    value = +value;
    if (typeof value !== "number") return "Please select a node.";
    if (value < 1) return "Please select a valid node";
  }

  const nodeIdField: IFormField = {
    label: "Node ID",
    symbol: "nodeId",
    type: "number",
    placeholder: "Your Node ID",
    validator: _nodeValidator,
  };

  interface IResources { cru: number; sru: number; hru: number; mru: number; ipv4u: number; } // prettier-ignore
  interface ICapacity { total: IResources; used: IResources; } // prettier-ignore

  let _ctrl: AbortController;
  let _nodeId: number;
  let validating: boolean = false;
  $: {
    if (profile && _nodeId !== data) {
      if (!data || !!_nodeValidator(data)) {
        if (_ctrl) {
          _ctrl.abort();
          _ctrl = null;
        }
        validating = false;
        status = null;
      } else {
        _nodeId = data;
        if (_ctrl) _ctrl.abort();
        _ctrl = new AbortController();

        const { networkEnv } = profile;
        const grid = new GridClient("" as any, "", "", null);
        const { rmbProxy } = grid.getDefaultUrls(networkEnv as any);

        validating = true;
        status = null;
        fetch(`${rmbProxy}/nodes/${data}`, {
          method: "GET",
          signal: _ctrl.signal,
        })
          .then<{ capacity: ICapacity }>((res) => res.json())
          .then(({ capacity }) => {
            const { total, used } = capacity;
            // prettier-ignore
            let valid = (total.cru - used.cru) >= filters.cru &&
                        ((total.sru - used.sru) / 1024 ** 3) >= filters.sru &&
                        ((total.mru - used.mru) / 1024 ** 3) >= filters.mru;

            if (!valid) {
              status = "invalid";
              return;
            }

            if (filters.publicIPs) {
              return gqlApi<{ nodes: { id: number }[] }>(
                profile,
                "query getFarmId($id: Int!) { nodes(where: { nodeId_eq: $id }) { id: farmId }}",
                { id: data }
              )
                .then(({ nodes: [{ id }] }) => {
                  return gqlApi<{publicIps: []}>(profile, 'query getIps($id: Int!) { publicIps(where: { contractId_eq: 0, farm: {farmId_eq: $id}}) {id}}', { id }); // prettier-ignore
                })
                .then(({ publicIps: ips }) => {
                  status = ips.length > 0 ? "valid" : "invalid";
                });
            } else {
              status = "valid";
            }
          })
          .catch((err: Error) => {
            console.log("Error", err);
            if (err.message.includes("aborted a request")) return;
            status = "invalid";
          })
          .finally(() => {
            validating = false;
          });
      }
    }
  }

  // temp solution :/
  $: if (profile) onLoadNodesHandler({});
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
    disabled={loadingNodes || !profile}
    type="button"
    on:click={onLoadNodesHandler}
  >
    Apply Filters and Suggest Nodes
  </button>

  <Input
    bind:data
    field={{
      label: `Node ID (Found ${nodeIdSelectField.options.length - 1})`,
      type: "select",
      symbol: "nodeId",
      options: nodeIdSelectField.options,
    }}
  />
{:else if nodeSelection === "manual"}
  <Input bind:data field={nodeIdField} />
  {#if validating && data}
    <p class="help is-success">Validating node {data}</p>
  {/if}
  {#if !validating && data}
    {#if status == "valid"}
      <p class="help is-success">
        Node(<strong>{data}</strong>) is up and has enough resources.
      </p>
    {:else if status === "invalid"}
      <p class="help is-danger">
        Node(<strong>{data}</strong>) might be down or doesn't have enough
        resources.
      </p>
    {/if}
  {/if}
{/if}
