<svelte:options tag={null} />

<script lang="ts">
  import VM, { Disk, Env } from "../../types/vm";
  import type { IFlist, IFormField } from "../../types";
  const { events } = window.configs?.grid3_client ?? {};
  import deployVM from "../../utils/deployVM";
  import findNodes from "../../utils/findNodes";

  const configs = window.configs?.baseConfig;
  const deploymentStore = window.configs?.deploymentStore;

  const tabs = [
    { label: "Config" },
    { label: "Environment Variables" },
    { label: "Disks" },
  ];
  let active: string = "Config";
  let loading = false;
  let success = false;
  let failed = false;
  let profileIdx: number = 0;

  $: profiles = $configs;
  $: profile = $configs[profileIdx];

  const data = new VM();
  requestAnimationFrame(() => {
    data.envs = [new Env(undefined, "SSH_KEY", profile?.sshKey)];
  });

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "CPU", symbol: 'cpu', placeholder: 'Your CPU', type: 'number'},
    { label: "Memory", symbol: 'memory', placeholder: 'Your Memory in MB', type: 'number'},
    { label: "Public IP", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "", type: 'checkbox' },
    // { label: "Node ID", symbol: 'nodeId', placeholder: 'Your Node ID', type: 'number', link: { label: "Grid Explorer", url: "https://library.threefold.me/info/threefold#/manual_tfgrid3/threefold__grid3_explorer"}},
  ];

  // prettier-ignore
  const flistFields: IFormField[] = [
    { label: "FList", symbol: 'flist', placeholder: 'Your flist' },
    { label: "Entry Point", symbol: 'entrypoint', placeholder: 'Your Entrypoint'},
  ]

  // prettier-ignore
  const envFields: IFormField[] = [
    { label: 'Key', symbol: 'key', placeholder: "Your Env Key"},
    { label: 'Value', symbol: 'value', placeholder: "Your Env Value"},
  ];

  // prettier-ignore
  const diskFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Your Disk Name" },
    { label: "Size", symbol: "size", placeholder: "Disk size in GB", type: "number" },
    { label: "Mount Point", symbol: "mountpoint", placeholder: "Your Disk Mount Point" },
  ];

  let message: string;
  function onDeployVM() {
    loading = true;
    success = false;
    failed = false;
    message = undefined;

    function onLogInfo(msg: string) {
      if (typeof msg === "string") {
        message = msg;
      }
    }

    events.addListener("logs", onLogInfo);

    deployVM(data, profile)
      .then(() => {
        deploymentStore.set(0);
        success = true;
      })
      .catch((err: Error) => {
        failed = true;

        message = typeof err === "string" ? err : err.message;
      })
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
  }

  // prettier-ignore
  const flists: IFlist[] = [
    { name: "Alpine", url: "https://hub.grid.tf/tf-official-apps/base:latest.flist", entryPoint: "/sbin/zinit init" },
    { name: "Ubuntu", url: "https://hub.grid.tf/omar0.3bot/omarelawady-ubuntu-20.04.flist", entryPoint: "/init.sh" },
  ];
  let flistIdx: number | string;

  function onSelectFlist() {
    if (flistIdx && +flistIdx <= flists.length) {
      data.flist = flists[flistIdx].url;
      data.entrypoint = flists[flistIdx].entryPoint;
    }
  }

  const onSelectProfile = (e: Event) => profileIdx = (e.target as any).selectedIndex; // prettier-ignore

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

  // prettier-ignore
  const filtersFields = [
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

  let nodeSelection: string;
  let nodes: number[] = [];
  let loadingNodes: boolean = false;
  function onLoadNodesHandler() {
    loadingNodes = true;
    findNodes(nodeFilters, profile)
      .then((_nodes) => {
        nodes = _nodes;
      })
      .finally(() => (loadingNodes = false));
  }
</script>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Virtual Machine</h4>
    <hr />

    {#if loading}
      <div class="notification is-info">
        {#if message}
          &gt; {message}.
        {:else}
          &gt; Loading...
        {/if}
      </div>
    {:else if success}
      <div class="notification is-success">&gt; Successfully deployed VM.</div>
    {:else if failed}
      <div class="notification is-danger">
        &gt;
        {#if message}
          {message}
        {:else}
          Failed to deploy VM.
        {/if}
      </div>
    {:else}
      <div
        class="select mb-4"
        style="display: flex; justify-content: flex-end;"
      >
        <select on:change={onSelectProfile}>
          {#each profiles as profile, idx (idx)}
            <option value={idx}
              >{#if profile.name}
                {profile.name}
              {:else}
                Profile {idx + 1}
              {/if}</option
            >
          {/each}
        </select>
      </div>
      <div class="tabs is-centered">
        <ul>
          {#each tabs as tab (tab.label)}
            <li class={active === tab.label ? "is-active" : ""}>
              <a href="#!" on:click|preventDefault={() => (active = tab.label)}>
                <span>{tab.label}</span>
              </a>
            </li>
          {/each}
        </ul>
      </div>

      {#if active === "Config"}
        <div class="field">
          <p class="label">Name</p>
          <div class="control">
            <input
              class="input"
              type="text"
              placeholder="Virtual Machine Name"
              bind:value={data.name}
            />
          </div>
        </div>

        <p class="label">Flists</p>
        <div class="select mb-2" style="width: 100%;">
          <select
            style="width: 100%;"
            bind:value={flistIdx}
            on:change={onSelectFlist}
          >
            <option selected disabled>Please select a flist</option>
            {#each flists as f, idx (f.url)}
              <option value={idx}>{f.name}</option>
            {/each}
            <option value="other">Other</option>
          </select>
        </div>
        {#if flistIdx === "other"}
          {#each flistFields as field (field.symbol)}
            <div class="field">
              <p class="label">
                {field.label}
              </p>
              <div class="control">
                <input
                  class="input"
                  type="text"
                  placeholder={field.placeholder}
                  bind:value={data[field.symbol]}
                />
              </div>
            </div>
          {/each}
        {/if}
        {#each baseFields as field (field.symbol)}
          <div class="field">
            <p class="label">
              {field.label}
              {#if field.link}
                (<a href={field.link.url} target="_blank">{field.link.label}</a
                >)
              {/if}
            </p>
            <div class="control">
              {#if field.type === "number"}
                <input
                  class="input"
                  type="number"
                  placeholder={field.placeholder}
                  bind:value={data[field.symbol]}
                />
              {:else if field.type === "checkbox"}
                <label class="checkbox">
                  <input
                    type="checkbox"
                    checked={data[field.symbol]}
                    on:change={() => (data[field.symbol] = !data[field.symbol])}
                  />
                  {field.label}
                </label>
              {:else}
                <input
                  class="input"
                  type="text"
                  placeholder={field.placeholder}
                  bind:value={data[field.symbol]}
                />
              {/if}
            </div>
          </div>
        {/each}

        <p class="label">Node Selection</p>
        <div class="select mb-2">
          <select bind:value={nodeSelection}>
            <option selected disabled>Choose a way to select node</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {#if nodeSelection === "automatic"}
          <section style="width: 50%;">
            <h5 class="is-size-3 has-text-weight-bold">Nodes Filter</h5>
            {#each filtersFields as field (field.symbol)}
              {#if field.type === "checkbox"}
                <div style="display: flex; align-items: center;" class="mb-2">
                  <label class="switch">
                    <input
                      type="checkbox"
                      bind:checked={nodeFilters[field.symbol]}
                      id={field.symbol}
                    />
                    <span class="slider" />
                  </label>
                  <label
                    for={field.symbol}
                    class="label ml-2"
                    style="cursor: pointer;"
                  >
                    {field.label}
                  </label>
                </div>
              {/if}

              {#if field.type === "text"}
                <div class="field">
                  <p class="label">{field.label}</p>
                  <div class="control">
                    <input
                      class="input"
                      type="text"
                      placeholder={field.label}
                      bind:value={nodeFilters[field.symbol]}
                    />
                  </div>
                </div>
              {/if}

              {#if field.type === "number"}
                <div class="field">
                  <p class="label">{field.label}</p>
                  <div class="control">
                    <input
                      class="input"
                      type="number"
                      placeholder={field.label}
                      bind:value={nodeFilters[field.symbol]}
                    />
                  </div>
                </div>
              {/if}
            {/each}

            <button
              class={"button is-primary mt-2 " +
                (loadingNodes ? "is-loading" : "")}
              disabled={loadingNodes}
              type="button"
              on:click={onLoadNodesHandler}
            >
              Apply Filters
            </button>

            <div class="select mt-4">
              <p class="label">Node ID</p>
              <select bind:value={data.nodeId}>
                <option selected disabled>
                  {#if loadingNodes}
                    Loading...
                  {:else}
                    Please select a node ID
                  {/if}
                </option>
                {#each nodes as node (node)}
                  <option value={node}>
                    {node}
                  </option>
                {/each}
              </select>
            </div>
          </section>
        {:else if nodeSelection === "manual"}
          <div class="field">
            <p class="label">Node ID</p>
            <div class="control">
              <input
                class="input"
                type="number"
                placeholder="Your Node ID"
                bind:value={data.nodeId}
              />
            </div>
          </div>
        {/if}
      {/if}

      {#if active === "Environment Variables"}
        <div class="actions" style="margin-bottom: 20px;">
          <button
            type="button"
            class="button is-primary"
            on:click={() => (data.envs = [...data.envs, new Env()])}
          >
            <span>+</span>
          </button>
        </div>
        <div class="vm-container">
          {#each data.envs as env, index (env.id)}
            <div class="box">
              <div class="vm-header">
                <p class="is-size-5 has-text-weight-bold">{env.key}</p>
                <button
                  type="button"
                  class="button is-danger"
                  on:click={() =>
                    (data.envs = data.envs.filter((_, i) => index !== i))}
                >
                  <span>-</span>
                </button>
              </div>
              {#each envFields as field (field.symbol)}
                <div class="field">
                  <p class="label">{field.label}</p>
                  <div class="control">
                    <input
                      class="input"
                      type="text"
                      placeholder={field.placeholder}
                      bind:value={env[field.symbol]}
                    />
                  </div>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}

      {#if active === "Disks"}
        <div class="actions" style="margin-bottom: 20px;">
          <button
            type="button"
            class="button is-primary"
            on:click={() => (data.disks = [...data.disks, new Disk()])}
          >
            <span>+</span>
          </button>
        </div>
        <div class="vm-container">
          {#each data.disks as disk, index (disk.id)}
            <div class="box">
              <div class="vm-header">
                <p class="is-size-5 has-text-weight-bold">{disk.name}</p>
                <button
                  type="button"
                  class="button is-danger"
                  on:click={() =>
                    (data.disks = data.disks.filter((_, i) => index !== i))}
                >
                  <span>-</span>
                </button>
              </div>
              {#each diskFields as field (field.symbol)}
                <div class="field">
                  <p class="label">{field.label}</p>
                  <div class="control">
                    <input
                      class="input"
                      type="text"
                      placeholder={field.placeholder}
                      bind:value={disk[field.symbol]}
                    />
                  </div>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    {/if}

    <div class="actions">
      <button
        class={"button is-primary " + (loading ? "is-loading" : "")}
        type="submit"
        disabled={((loading || !data.valid) && !(success || failed)) ||
          !profile ||
          profile.mnemonics === "" ||
          profile.storeSecret === ""}
        on:click={(e) => {
          if (success || failed) {
            e.preventDefault();
            success = false;
            failed = false;
            loading = false;
          }
        }}
      >
        {#if success || failed}
          Back
        {:else}
          Deploy
        {/if}
      </button>
    </div>
  </form>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .vm-container {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 70vh;
    will-change: transform;
    padding-bottom: 5rem;
    margin-bottom: 20px;
  }

  .vm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Switch */
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: 0.4s;
      transition: 0.4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: 0.4s;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #2196f3;
    }

    input:checked + .slider {
      box-shadow: 0 0 1px #2196f3;
    }

    input:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }
  }

  .select,
  .select > select {
    width: 100%;
  }
</style>
