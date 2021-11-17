<svelte:options tag={null} />

<script lang="ts">
  import VM, { Disk, Env } from "../../types/vm";
  import type { IFormField } from "../../types";
  const { events } = window.configs?.grid3_client ?? {};
  import deployVM from "../../utils/deployVM";

  const data = new VM();
  const configs = data.configs;

  const tabs = [
    { label: "Config" },
    { label: "Environment Variables" },
    { label: "Disks" },
    { label: "Credentials" },
  ];
  let active: string = "Config";
  let loading = false;
  let success = false;
  let failed = false;
  let password: string = "";

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: 'name', placeholder: 'Your VM name.'},
    { label: "FList", symbol: 'flist', placeholder: 'Your flist.'},
    { label: "Entry Point", symbol: 'entrypoint', placeholder: 'Your Entrypoint.'},    
    { label: "CPU", symbol: 'cpu', placeholder: 'Your CPU.', type: 'number'},
    { label: "Memory", symbol: 'memory', placeholder: 'Your Memory in MB.', type: 'number'},
    { label: "Public IP", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "", type: 'checkbox' },
    { label: "Node ID", symbol: 'nodeId', placeholder: 'Your Node ID.', type: 'number', link: { label: "Grid Explorer", url: "https://explorer.tfchain.dev.threefold.io/nodes"}},
  ];


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

  // prettier-ignore
  const configFields: IFormField[] = [
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Mnemonics of your tfchain account" },
    { label: "Store Secret", symbol: "storeSecret", placeholder: "secret key used for data encryption" },
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

    deployVM(data)
      .then(() => (success = true))
      .catch((err: Error) => {
        failed = true;
        message = err.message;
      })
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
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
        <select bind:value={$configs.networkEnv}>
          <option value="test">Testnet</option>
          <option value="dev">Devnet</option>
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
        <!-- Show Base Info -->
        {#each baseFields as field (field.symbol)}
          <div class="field">
            <p class="label">{field.label}
            {#if field.link}
              (<a href={field.link.url} target="_blank">{field.link.label}</a>)
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

      {#if active === "Credentials"}
        {#each configFields as field (field.symbol)}
          <div class="field">
            <p class="label">{field.label}</p>
            <div class="control">
              {#if field.type === "password"}
                <input
                  class="input"
                  type="password"
                  autocomplete="off"
                  placeholder={field.placeholder}
                  bind:value={$configs[field.symbol]}
                />
              {:else}
                <input
                  class="input"
                  type="text"
                  placeholder={field.placeholder}
                  bind:value={$configs[field.symbol]}
                />
              {/if}
            </div>
          </div>
        {/each}
      {/if}
    {/if}

    <div class="actions">
      {#if $configs.loaded === false}
        <button
          type="button"
          class="button is-primary is-outlined mr-2"
          disabled={$configs.storeSecret === ""}
          on:click={() => {
            configs.load();
          }}
        >
          Load
        </button>
        <button
          type="button"
          class="button is-success mr-2"
          disabled={$configs.storeSecret === "" || $configs.mnemonics === ""}
          on:click={() => {
            configs.save();
          }}
        >
          Save
        </button>
      {/if}
      <button
        class={"button is-primary " + (loading ? "is-loading" : "")}
        type="submit"
        disabled={(loading || !data.valid) && !(success || failed)}
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
</style>