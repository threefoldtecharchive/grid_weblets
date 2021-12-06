<svelte:options tag="tf-select-node-id" />

<script lang="ts">
  import type { IFormField, ISelectOption } from "../types";
  import type { IProfile } from "../types/Profile";
  import findNodes from "../utils/findNodes";
  import fetchFarmAndCountries from "../utils/fetchFarmAndCountries";

  // components
  import Input from "./Input.svelte";
  import gqlApi from "../utils/gqlApi";
  const { GridClient } = window.configs?.grid3_client ?? {};

  export let cpu: number;
  export let memory: number;
  export let ssd: number;
  export let publicIp: boolean;
  export let data: number;
  export let status: "up" | "down";
  // export let error: string = null;

  export let profile: IProfile;
  let loadingNodes: boolean = false;

  // prettier-ignore
  const filtersFields: IFormField[] = [
    { label: "Farm Name", symbol: "farmName", type: "select", placeholder: "Enter farm name", options: [
      { label: "Please select a farm", value: null, selected: true }
    ] },
    { label: "Country", symbol: "country", type: "select", placeholder: "Enter a country name", options: [
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
      if (!!_nodeValidator(data) && _ctrl) {
        _ctrl.abort();
        _ctrl = null;
        validating = true;
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
        let _capacity: ICapacity;
        fetch(`${rmbProxy}/nodes/${data}`, {
          method: "GET",
          signal: _ctrl.signal,
        })
          .then<{ capacity: ICapacity }>((res) => res.json())
          .then(({ capacity }) => {
            _capacity = capacity;
            const { total, used } = capacity;
            // prettier-ignore
            let valid = (total.cru - used.cru) >= filters.cru &&
                        ((total.sru - used.sru) / 1024 ** 3) >= filters.sru &&
                        ((total.mru - used.mru) / 1024 ** 3) >= filters.mru;

            if (!valid) {
              status = "down";
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
                  status = ips.length > 0 ? "up" : "down";
                });
            } else {
              status = "up";
            }
          })
          .catch((err: Error) => {
            console.log("Error", err);
            if (err.message.includes("aborted a request")) return;
            status = "down";
          })
          .finally(() => {
            validating = false;
          });
      }
    }
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
  {#if validating}
    <p class="help is-success">Validating node {data}</p>
  {/if}
  {#if !validating}
    {#if status == "up"}
      <p class="help is-success">
        Node(<strong>{data}</strong>) is up and has enough resources
      </p>
    {:else if status === "down"}
      <p class="help is-danger">
        Node(<strong>{data}</strong>) might be down or doesn't have enough
        resources
      </p>
    {/if}
  {/if}
{/if}
