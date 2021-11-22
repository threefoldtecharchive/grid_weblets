<svelte:options tag={null} />

<script lang="ts">
  import Kubernetes, { Worker } from "../../types/kubernetes";
  import deployKubernetes from "../../utils/deployKubernetes";
  const { events } = window.configs?.grid3_client ?? {};
  import type { IFormField } from "../../types";

  const data = new Kubernetes();

  // prettier-ignore
  const kubernetesFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Your K8S Name" },
    { label: "Cluster Token", symbol: "secret", placeholder: "Your Cluster Token" },
    { label: "Public SSH Key", symbol: "sshKey", placeholder: "Your Public SSH Key" },
    // { label: "Metadata", symbol: "metadata", placeholder: "Your Metadata" },
    // { label: "Description", symbol: "description", placeholder: "Your Description", textarea: true },
  ];

  // prettier-ignore
  const networkFields: IFormField[] = [
    { label: "Network Name", symbol: "name", placeholder: "Your Network Name" },
    { label: "Network IP Range", symbol: "ipRange", placeholder: "Your Network IP Range" },
  ];

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Enter name" },
    { label: "CPU", symbol: "cpu", placeholder: "CPU", type: 'number' },
    { label: "Memory", symbol: "memory", placeholder: "Memory in MB", type: 'number' },
    { label: "Disk Size", symbol: "diskSize", placeholder: "Disk size in GB", type: 'number' },
    { label: "Public IP", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Plantery Network", symbol: "plantery", placeholder: "", type: 'checkbox' },
    { label: "Node ID", symbol: "node", placeholder: "Node ID", type: 'number', link: { label: "Grid Explorer", url: "https://library.threefold.me/info/threefold#/manual_tfgrid3/threefold__grid3_explorer"}},
    // { label: "Root FS Size", symbol: "rootFsSize", placeholder: "Root File System Size", type: 'number' },
  ];

  const tabs = [{ label: "Config" }, { label: "Master" }, { label: "Workers" }];
  let active: string = "Config";
  let loading = false;
  let success = false;
  let failed = false;
  const configs = window.configs?.baseConfig;
  const deploymentStore = window.configs?.deploymentStore;
  let profileIdx: number = 0;

  $: profiles = $configs;
  $: profile = $configs[profileIdx];

  let message: string;
  function onDeployKubernetes() {
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

    deployKubernetes(data, profile)
      .then(() => {
        deploymentStore.set(0);
        success = true;
      })
      .catch((err: Error) => {
        failed = true;
        message = err.message;
      })
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
  }

  const onSelectProfile = (e: Event) => profileIdx = (e.target as any).selectedIndex; // prettier-ignore
</script>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployKubernetes} class="box">
    <h4 class="is-size-4">Deploy a Kubernetes</h4>
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
      <div class="notification is-success">&gt; Successfully deployed K8S.</div>
    {:else if failed}
      <div class="notification is-danger">
        &gt;
        {#if message}
          {message}
        {:else}
          Failed to deploy K8S.
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
        <!-- Show Base Info -->
        {#each kubernetesFields as field (field.symbol)}
          <div class="field">
            <p class="label">{field.label}</p>
            <div class="control">
              {#if field.textarea}
                <textarea
                  class="textarea"
                  placeholder={field.placeholder}
                  bind:value={data[field.symbol]}
                />
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

      {#if active === "Master"}
        <!-- Show Master Info -->
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
                  bind:value={data.master[field.symbol]}
                />
              {/if}

              {#if field.type === "checkbox"}
                <label class="checkbox">
                  <input
                    type="checkbox"
                    checked={data.master[field.symbol]}
                    on:change={() =>
                      (data.master[field.symbol] = !data.master[field.symbol])}
                  />
                  {field.label}
                </label>
              {/if}

              {#if !field.type}
                <input
                  class="input"
                  type="text"
                  placeholder={field.placeholder}
                  bind:value={data.master[field.symbol]}
                />
              {/if}
            </div>
          </div>
        {/each}
      {/if}

      {#if active === "Workers"}
        <!-- Show Workers Info -->
        <div class="actions" style="margin-bottom: 20px;">
          <button
            type="button"
            class="button is-primary"
            on:click={() => (data.workers = [...data.workers, new Worker()])}
          >
            <span>+</span>
          </button>
        </div>
        <div class="worker-container">
          {#each data.workers as worker, index (worker.id)}
            <div class="box">
              <div class="worker-header">
                <p class="is-size-5 has-text-weight-bold">{worker.name}</p>
                <button
                  type="button"
                  class="button is-danger"
                  on:click={() =>
                    (data.workers = data.workers.filter((_, i) => index !== i))}
                >
                  <span>-</span>
                </button>
              </div>
              {#each baseFields as field (field.symbol)}
                <div class="field">
                  <p class="label">
                    {field.label}
                    {#if field.link}
                      (<a href={field.link.url} target="_blank"
                        >{field.link.label}</a
                      >)
                    {/if}
                  </p>
                  <div class="control">
                    {#if field.type === "number"}
                      <input
                        class="input"
                        type="number"
                        placeholder={field.placeholder}
                        bind:value={worker[field.symbol]}
                      />
                    {/if}

                    {#if field.type === "checkbox"}
                      <label class="checkbox">
                        <input
                          type="checkbox"
                          checked={worker[field.symbol]}
                          on:change={() =>
                            (worker[field.symbol] = !worker[field.symbol])}
                        />
                        {field.label}
                      </label>
                    {/if}

                    {#if !field.type}
                      <input
                        class="input"
                        type="text"
                        placeholder={field.placeholder}
                        bind:value={worker[field.symbol]}
                      />
                    {/if}
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

  .worker-container {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 70vh;
    will-change: transform;
    padding-bottom: 5rem;
    margin-bottom: 20px;
  }

  .actions,
  .worker-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .worker-header {
    justify-content: space-between;
  }
</style>
