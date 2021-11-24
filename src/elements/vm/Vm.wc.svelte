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
  import DeleteBtn from "../../components/DeleteBtn.svelte";
  import AddBtn from "../../components/AddBtn.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";

  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Environment Variables", value: "env" },
    { label: "Disks", value: "disks" },
  ];

  let data = new VM();

  // prettier-ignore
  let baseFields: IFormField[] = [
    { label: "CPU", symbol: 'cpu', placeholder: 'CPU Cores', type: 'number' },
    { label: "Memory (MB)", symbol: 'memory', placeholder: 'Your Memory in MB', type: 'number' },
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
    label: "VM Image",
    symbol: "flist",
    type: "select",
    options: [
      { label: "Please select an image", value: null, selected: true, disabled: true },
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
    { label: "FList", symbol: 'flist', placeholder: 'VM Image', type: "text" },
    { label: "Entry Point", symbol: 'entrypoint', placeholder: 'Entrypoint', type: "text"},
  ]

  // prettier-ignore
  const envFields: IFormField[] = [
    { label: 'Key', symbol: 'key', placeholder: "Environment Key", type: "text"},
    { label: 'Value', symbol: 'value', placeholder: "Environment Value", type: "text" },
  ];

  // prettier-ignore
  const diskFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Disk Name", type: "text" },
    { label: "Size", symbol: "size", placeholder: "Disk size in GB", type: "number" },
    { label: "Mount Point", symbol: "mountpoint", placeholder: "Disk Mount Point", type: "text" },
  ];

  const { events } = window.configs?.grid3_client ?? {};
  const deploymentStore = window.configs?.deploymentStore;
  let active: string = "config";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || profile.mnemonics === "" || profile.storeSecret === ""; // prettier-ignore

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
</script>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Virtual Machine</h4>
    <hr />

    {#if loading}
      <Alert type="info" message={message || "Loading..."} />
    {:else if success}
      <Alert type="success" message="Successfully deployed VM." />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy VM."} />
    {:else}
      <SelectProfile
        on:profile={({ detail }) => {
          profile = detail;
          data.envs[0] = new Env(undefined, "SSH_KEY", detail.sshKey);
        }}
      />
      <Tabs bind:active {tabs} />

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

        <SelectNodeId
          cpu={data.cpu}
          memory={data.memory}
          ssd={data.disks.reduce(
            (total, disk) => total + disk.size,
            data.rootFsSize
          )}
          bind:data={data.nodeId}
          {profile}
        />
      {:else if active === "env"}
        <AddBtn on:click={() => (data.envs = [...data.envs, new Env()])} />
        <div class="nodes-container">
          {#each data.envs as env, index (env.id)}
            <div class="box">
              <DeleteBtn
                name={env.key}
                on:click={() =>
                  (data.envs = data.envs.filter((_, i) => index !== i))}
              />
              {#each envFields as field (field.symbol)}
                <Input bind:data={env[field.symbol]} {field} />
              {/each}
            </div>
          {/each}
        </div>
      {:else if active === "disks"}
        <AddBtn on:click={() => (data.disks = [...data.disks, new Disk()])} />
        <div class="nodes-container">
          {#each data.disks as disk, index (disk.id)}
            <div class="box">
              <DeleteBtn
                name={disk.name}
                on:click={() =>
                  (data.disks = data.disks.filter((_, i) => index !== i))}
              />
              {#each diskFields as field (field.symbol)}
                <Input bind:data={disk[field.symbol]} {field} />
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    {/if}

    <DeployBtn
      {disabled}
      {loading}
      {failed}
      {success}
      on:click={(e) => {
        if (success || failed) {
          e.preventDefault();
          success = false;
          failed = false;
          loading = false;
        }
      }}
    />
  </form>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import "../../assets/global.scss";
</style>
