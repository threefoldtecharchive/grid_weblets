<svelte:options tag={null} />

<script lang="ts">
  import VM, { Disk, Env } from "../../types/vm";
  import type { IFormField } from "../../types";
  const { events } = window.configs?.grid3_client ?? {};
  import deployVM from "../../utils/deployVM";

  const data = new VM();

  const tabs = [
    { label: "Base", icon: "far fa-paper-plane" },
    { label: "Envs", icon: "fas fa-code-branch" },
    { label: "Disks", icon: "far fa-save" },
    { label: "Configs", icon: "fas fa-cogs" },
  ];
  let active: string = "Base";
  let loading = false;

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: 'name', placeholder: 'Your VM name.'},
    { label: "FList", symbol: 'flist', placeholder: 'Your flist.'},
    { label: "CPU", symbol: 'cpu', placeholder: 'Your Cpu size.', type: 'number'},
    { label: "Memory", symbol: 'memory', placeholder: 'Your Memory size.', type: 'number'},
    { label: "Entry Point", symbol: 'entrypoint', placeholder: 'Your Entrypoint.'},
    { label: "Public IP", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Node ID", symbol: 'nodeId', placeholder: 'Your Node ID.', type: 'number'},
    { label: "Root FS Size", symbol: 'rootFsSize', placeholder: 'Your Root File System Size.', type: 'number'},
    { label: "Planetary", symbol: "planetary", placeholder: "", type: 'checkbox' },
  ];

  // prettier-ignore
  const networkFields: IFormField[] = [
    { label: "Network Name", symbol: "name", placeholder: "Your Network Name." },
    { label: "Network IP Range", symbol: "ipRange", placeholder: "Your Network IP Range." },
  ];

  // prettier-ignore
  const envFields: IFormField[] = [
    { label: 'Key', symbol: 'key', placeholder: "Your Env Key."},
    { label: 'Value', symbol: 'value', placeholder: "Your Env Value."},
  ];

  // prettier-ignore
  const diskFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Your Disk Name." },
    { label: "Size", symbol: "size", placeholder: "Your Disk Size.", type: "number" },
    { label: "Mount Point", symbol: "mountpoint", placeholder: "Your Disk Mount Point." },
  ];

  // prettier-ignore
  const configFields: IFormField[] = [
    { label: "Proxy URL", symbol: "proxyURL", placeholder: "Your Proxy URL." },
    { label: "URL", symbol: "url", placeholder: "Your substrate URL." },
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Your Mnemonics." },
  ];

  let message: string;
  function onDeployVM() {
    loading = true;

    function onLogInfo(msg: string) {
      if (typeof msg === "string") {
        message = msg;
      }
    }

    events.addListener("logs", onLogInfo);

    deployVM(data)
      .then(console.log)
      .catch(console.log)
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
  }
</script>

<form on:submit|preventDefault={onDeployVM} class="box">
  <h4 class="is-size-4">Deploy a Virtual Machine</h4>

  <div class="tabs is-centered is-boxed is-medium">
    <ul>
      {#each tabs as tab (tab.label)}
        <li class={active === tab.label ? "is-active" : ""}>
          <a href="#!" on:click|preventDefault={() => (active = tab.label)}>
            <span class="icon is-small">
              <i class={tab.icon} aria-hidden="true" />
            </span>
            <span>{tab.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </div>

  {#if active === "Base"}
    <!-- Show Base Info -->
    {#each baseFields as field (field.symbol)}
      <div class="field">
        <p class="label">{field.label}</p>
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

    <!-- Network info -->
    {#each networkFields as field (field.symbol)}
      <div class="field">
        <p class="label">{field.label}</p>
        <div class="control">
          <input
            class="input"
            type="text"
            placeholder={field.placeholder}
            bind:value={data.network[field.symbol]}
          />
        </div>
      </div>
    {/each}
  {/if}

  {#if active === "Envs"}
    <div class="actions" style="margin-bottom: 20px;">
      <button
        type="button"
        class="button is-primary is-light"
        on:click={() => (data.envs = [...data.envs, new Env()])}
      >
        <span class="icon is-medium">
          <i class="far fa-plus-square" />
        </span>
        <span>ADD Env</span>
      </button>
    </div>
    <div class="vm-container">
      {#each data.envs as env, index (env.id)}
        <div class="box">
          <div class="vm-header">
            <p class="is-size-5 has-text-weight-bold">{env.key}</p>
            <button
              type="button"
              class="button is-danger is-outlined"
              on:click={() =>
                (data.envs = data.envs.filter((_, i) => index !== i))}
            >
              <span>Delete</span>
              <span class="icon is-small">
                <i class="fas fa-times" />
              </span>
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
        class="button is-primary is-light"
        on:click={() => (data.disks = [...data.disks, new Disk()])}
      >
        <span class="icon is-medium">
          <i class="far fa-plus-square" />
        </span>
        <span>ADD Disk</span>
      </button>
    </div>
    <div class="vm-container">
      {#each data.disks as disk, index (disk.id)}
        <div class="box">
          <div class="vm-header">
            <p class="is-size-5 has-text-weight-bold">{disk.name}</p>
            <button
              type="button"
              class="button is-danger is-outlined"
              on:click={() =>
                (data.disks = data.disks.filter((_, i) => index !== i))}
            >
              <span>Delete</span>
              <span class="icon is-small">
                <i class="fas fa-times" />
              </span>
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

  {#if active === "Configs"}
    {#each configFields as field (field.symbol)}
      <div class="field">
        <p class="label">{field.label}</p>
        <div class="control">
          {#if field.type === "number"}
            <input
              class="input"
              type="number"
              placeholder={field.placeholder}
              bind:value={data.configs[field.symbol]}
            />
          {:else}
            <input
              class="input"
              type="text"
              placeholder={field.placeholder}
              bind:value={data.configs[field.symbol]}
            />
          {/if}
        </div>
      </div>
    {/each}
  {/if}

  <div class="actions">
    {#if loading && message}
      <div class="mr-5">
        *{message}.
      </div>
    {/if}
    <button
      class={"button is-primary " + (loading ? "is-loading" : "")}
      type="submit"
      disabled={loading || !data.valid}
    >
      Deploy
    </button>
  </div>
</form>

<style lang="scss" scoped>
  @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");
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
</style>
