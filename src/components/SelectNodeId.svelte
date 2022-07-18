<svelte:options tag="tf-select-node-id" />

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { IFormField, ISelectOption } from "../types";
  import type { IProfile } from "../types/Profile";
  import findNodes from "../utils/findNodes";
  import fetchFarms from "../utils/fetchFarms";
  import { fetchCountries } from "../utils/fetchCountries";

  // components
  import Input from "./Input.svelte";
  import gqlApi from "../utils/gqlApi";
  import baseConfig from "../stores/baseConfig";
  const { GridClient } = window.configs?.grid3_client ?? {};

  const dispatch = createEventDispatcher<{ fetch: ISelectOption[] }>();
  export let cpu: number;
  export let memory: number;
  export let ssd: number;
  export let publicIp: boolean;
  export let data: number;
  export let status: "valid" | "invalid" | "dedicated";
  export let nodes: ISelectOption[] = [];
  // export let error: string = null;

  export let exclusiveFor: string = "";

  export let profile: IProfile;
  let loadingNodes: boolean = false;

  const configs = window.configs?.baseConfig;

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

  function onLoadNodesHandler() {
    loadingNodes = true;
    status = null;
    const label = "Please select a node id.";
    nodeIdSelectField.options[0].label = "Loading...";
    const _filters = {
      publicIPs: filters.publicIPs,
      country: filters.country,
      farmName: filters.farmName,
      cru: filters.cru,
      mru: filters.mru,
      sru: filters.sru,
      availableFor: $configs.twinId,
    };

    findNodes(_filters, profile, exclusiveFor)
      .then((_nodes) => {
        dispatch("fetch", _nodes);
        if (_nodes.length <= 0) {
          data = null;
          status = null;
          nodeIdSelectField.options[0].label = "No nodes available";
        } else if (!_nodes.some((node) => node.value === data)) {
          nodeIdSelectField.options[0].label = label;
          nodes = _nodes;
          data = +_nodes[0].value;
          status = "valid";
        } else {
          nodeIdSelectField.options[0].label = label;
          status = "valid";
        }
      })
      .catch((err) => {
        console.log("Error", err);
        data = null;
        status = null;
        nodeIdSelectField.options[0].label = "No nodes available";
      })
      .finally(() => {
        loadingNodes = false;
      });
  }

  $: {
    const [option] = nodeIdSelectField.options;
    nodeIdSelectField.options = [option, ...nodes];
  }

  function _setLabel(index: number, oldLabel: string,  label: string = "Loading...") {
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
        const op = { label: name, value: name } as ISelectOption;
        res.push(op);
        return res;
      },
      [option]
    );
  }

  function _setCountriesOptions(
    index: number,
    items: Map< string, Number >
  ) {
    const [option] = filtersFields[index].options;
    filtersFields[index].options = Object.entries(items).map( function ([name, code]) {
        const op = { label: name, value: name } as ISelectOption;
        return op;
      },
    );
    filtersFields[index].options.unshift(option);
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

      onLoadFarmsHandler();
    }
  }

  function onLoadFarmsHandler(){
    /* Loading farms & countries */
    const old_farm_label = "Please select a farm";
    const old_countries_label = "Please select a country";

    const farmsLabel = _setLabel(0, old_farm_label);
    const countriesLabel = _setLabel(1, old_countries_label);

    fetchFarms(profile, filters, exclusiveFor)
      .then(({ farms }) => {
        farms.sort((f0, f1) => f0.name.localeCompare(f1.name));
        _setOptions(0, farms);
      })
      .catch((err) => {
        console.log("Error", err);
      })
      .finally(() => {
        _setLabel(0, old_farm_label, farmsLabel);
      });

    fetchCountries(profile)
      .then(( countries ) => {
        _setCountriesOptions(1, countries);
      })
      .catch((err) => {
        console.log("Error", err);
      })
      .finally(() => {
        _setLabel(1, old_countries_label, countriesLabel);
      });
  }

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
  interface ICapacity { total_resources: IResources; used_resources: IResources; } // prettier-ignore

  let _ctrl: AbortController;
  let _nodeId: number;
  let validating: boolean = false;
  $: {
    if (nodeSelection === "manual")
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
            .then((node: any) => {
              if (node.dedicated && node.rentedByTwinId != $configs.twinId) {
                status = "dedicated";
                return;
              }

              if (node.status !== "up") {
                status = "invalid";
                return;
              }

              const { total_resources: total, used_resources: used } =
                node.capacity;
              // prettier-ignore
              let hasEnoughResources = (total.cru - used.cru) >= filters.cru &&
                        ((total.sru - used.sru) / 1024 ** 3) >= filters.sru &&
                        ((total.mru - used.mru) / 1024 ** 3) >= filters.mru;
              if (!hasEnoughResources) {
                status = "invalid";
                return;
              }

              if (filters.publicIPs) {
                return gqlApi<{ nodes: { id: number }[] }>(
                  profile,
                  "query getFarmId($id: Int!) { nodes(where: { nodeID_eq: $id }) { id: farmID }}",
                  { id: data }
                )
                  .then(({ nodes: [{ id }] }) => {
                    return gqlApi<{publicIps: []}>(profile, 'query getIps($id: Int!) { publicIps(where: { contractId_eq: 0, farm: {farmID_eq: $id}}) {id}}', { id }); // prettier-ignore
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

  /* Update when data change */
  let _cpu = cpu;
  let _memory = memory;
  let _ssd = ssd;
  let _publicIp = publicIp;

  const _reset = () => {
    requestAnimationFrame(() => {
      _nodeId = null;
      if (nodeSelection === "automatic") {
        onLoadNodesHandler();
        onLoadFarmsHandler();
      }
    });
  };

  $: {
    let _update = true;

    if (_cpu !== cpu) _cpu = cpu;
    else if (_memory !== memory) _memory = memory;
    else if (_ssd !== ssd) _ssd = ssd;
    else if (_publicIp !== publicIp) _publicIp = publicIp;
    else _update = false;

    if (_update) _reset();
  }
</script>

<Input
  bind:data={nodeSelection}
  field={nodeSelectionField}
  on:input={() => {
    if (nodeSelection === "manual") return (status = null);
    if (data !== null && nodes.length > 0) {
      status = "valid";
    }
  }}
/>
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
    class={"button mt-2 mb-2 " + (loadingNodes ? "is-loading" : "")}
    style={`background-color: #1982b1; color: #fff`}
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
    on:input={() => (status = "valid")}
  />
{:else if nodeSelection === "manual"}
  <Input bind:data field={nodeIdField} />
  {#if validating && data}
    <p class="help" style={`color: #1982b1`}>
      Validating node {data}
    </p>
  {/if}
  {#if !validating && data}
    {#if status == "valid"}
      <p class="help" style={`color: #1982b1`}>
        Node(<strong>{data}</strong>) is up and has enough resources.
      </p>
    {:else if status === "invalid"}
      <p class="help is-danger">
        Node(<strong>{data}</strong>) might be down or doesn't have enough
        resources.
      </p>
    {:else if status === "dedicated"}
      <p class="help is-danger">
        Node(<strong>{data}</strong>) is dedicated and not reserved for your
        account, please check the portal.
      </p>
    {/if}
  {/if}
{/if}
