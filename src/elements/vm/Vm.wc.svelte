<svelte:options tag="tf-vm" />

<script lang="ts">
  import VM, { Disk, Env } from "../../types/vm";
  import type { IFlist, IFormField, ITab } from "../../types";
  import deployVM from "../../utils/deployVM";
  import type { IProfile } from "../../types/Profile";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";

  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Environment Variables", value: "env" },
    { label: "Disks", value: "disks" },
  ];

  let data = new VM();

  // prettier-ignore
  let baseFields: IFormField[] = [
    { label: "CPU", symbol: 'cpu', placeholder: 'Your CPU', type: 'number' },
    { label: "Memory", symbol: 'memory', placeholder: 'Your Memory in MB', type: 'number' },
    { label: "Public IP", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "", type: 'checkbox' },
  ];

  const nameField: IFormField = { label: "Name", placeholder: "Virtual Machine Name", symbol: "name", type: "text" }; // prettier-ignore

  // prettier-ignore
  const flists: IFlist[] = [
    { name: "Alpine", url: "https://hub.grid.tf/tf-official-apps/base:latest.flist", entryPoint: "/sbin/zinit init" },
    { name: "Ubuntu", url: "https://hub.grid.tf/omar0.3bot/omarelawady-ubuntu-20.04.flist", entryPoint: "/init.sh" },
  ];

  // prettier-ignore
  const flistField: IFormField = {
    label: "Flists",
    symbol: "flist",
    type: "select",
    options: [
      { label: "Please select a flist", value: null, selected: true, disabled: true },
      { label: "Alpine", value: "0" },
      { label: "Ubuntu", value: "1" },
      { label: "Other", value: "other" }
    ]
  };
  let selectedFlist: number = 0;
  let flistSelectValue: string = null;
  $: {
    const option = flistField.options[selectedFlist];
    if (option.value !== "other") {
      const flist = flists[selectedFlist - 1];
      data.flist = flist?.url;
      data.entrypoint = flist?.entryPoint;
    }
  }

  // prettier-ignore
  const flistFields: IFormField[] = [
    { label: "FList", symbol: 'flist', placeholder: 'Your flist', type: "text" },
    { label: "Entry Point", symbol: 'entrypoint', placeholder: 'Your Entrypoint', type: "text"},
  ]

  // prettier-ignore
  // const envFields: IFormField[] = [
  //   { label: 'Key', symbol: 'key', placeholder: "Your Env Key", type: "text"},
  //   { label: 'Value', symbol: 'value', placeholder: "Your Env Value", type: "text" },
  // ];

  // prettier-ignore
  // const diskFields: IFormField[] = [
  //   { label: "Name", symbol: "name", placeholder: "Your Disk Name", type: "text" },
  //   { label: "Size", symbol: "size", placeholder: "Disk size in GB", type: "number" },
  //   { label: "Mount Point", symbol: "mountpoint", placeholder: "Your Disk Mount Point", type: "text" },
  // ];

  const { events } = window.configs?.grid3_client ?? {};
  const configs = window.configs?.baseConfig;
  const deploymentStore = window.configs?.deploymentStore;
  let active: string = "config";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;

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

  requestAnimationFrame(() => data.envs = [new Env(undefined, "SSH_KEY", profile?.sshKey)]); // prettier-ignore
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
      <SelectProfile bind:profile />
      <Tabs {tabs} bind:active />

      {#if active === "config"}
        <Input bind:data={data.name} field={nameField} />

        <Input
          bind:data={flistSelectValue}
          bind:selected={selectedFlist}
          field={flistField}
        />

        {#if flistSelectValue === "other"}
          {#each flistFields as field (field.symbol)}
            <Input bind:data={data[field.symbol]} {field} />
          {/each}
        {/if}

        {#each baseFields as field (field.symbol)}
          <Input bind:data={data[field.symbol]} {field} />
        {/each}

        <SelectNodeId bind:data={data.nodeId} {profile} />
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
              <!-- {#each envFields as field (field.symbol)}
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
              {/each} -->
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
              <!-- {#each diskFields as field (field.symbol)}
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
              {/each} -->
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
</style>
