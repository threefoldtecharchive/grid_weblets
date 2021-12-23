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
  import Modal from "../../components/DeploymentModal.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, {
    isInvalid,
    validateCpu,
    validateDisk,
    validateMemory,
  } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";

  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Environment Variables", value: "env" },
    { label: "Disks", value: "disks" },
  ];

  let data = new VM();

  // prettier-ignore
  let baseFields: IFormField[] = [
    { label: "CPU", symbol: 'cpu', placeholder: 'CPU Cores', type: 'number', validator: validateCpu, invalid: false},
    { label: "Memory (MB)", symbol: 'memory', placeholder: 'Your Memory in MB', type: 'number', validator: validateMemory, invalid: false },
    { label: "Public IP", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "", type: 'checkbox' },
  ];

  const nameField: IFormField = { label: "Name", placeholder: "Virtual Machine Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore

  // prettier-ignore
  const flists: IFlist[] = [
    { name: "Ubuntu", url: "https://hub.grid.tf/tf-official-apps/threefoldtech-ubuntu-20.04.flist", entryPoint: "/init.sh" },
    { name: "Alpine", url: "https://hub.grid.tf/tf-official-apps/threefoldtech-alpine-3.flist", entryPoint: "/entrypoint.sh" },
    { name: "CentOS", url: "https://hub.grid.tf/tf-official-apps/threefoldtech-centos-8.flist", entryPoint: "/entrypoint.sh" },

  ];

  // prettier-ignore
  const flistField: IFormField = {
    label: "VM Image",
    symbol: "flist",
    type: "select",
    options: [
      { label: "Ubuntu-20.04", value: "0", selected: true },
      { label: "Alpine-3", value: "1" },
      { label: "CentOS-8", value: "2" },
      { label: "Other", value: "other" }
    ]
  };
  let selectedFlist: number = 0;
  let flistSelectValue: string = "0";
  $: {
    const option = flistField.options[selectedFlist];
    if (option.value !== "other") {
      const flist = flists[selectedFlist];
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
    { label: "Size", symbol: "size", placeholder: "Disk size in GB", type: "number", validator: validateDisk, invalid: false },
    { label: "Mount Point", symbol: "mountpoint", placeholder: "Disk Mount Point", type: "text" },
  ];

  const deploymentStore = window.configs?.deploymentStore;
  let active: string = "config";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  const configs = window.configs?.baseConfig;

  let message: string;
  let modalData: Object;
  let status: "valid" | "invalid";
  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || nameField.invalid || isInvalid(baseFields) || isInvalid(diskFields); // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;

  async function onDeployVM() {
    loading = true;

    if (!hasEnoughBalance(profile)) {
      failed = true;
      loading = false;
      message =
        "No enough balance to execute transaction requires 2 TFT at least in your wallet.";
      return;
    }

    success = false;
    failed = false;
    message = undefined;

    deployVM(data, profile)
      .then((data) => {
        deploymentStore.set(0);
        success = true;
        modalData = data;
      })
      .catch((err: Error) => {
        failed = true;
        message = typeof err === "string" ? err : err.message;
      })
      .finally(() => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;
</script>

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
    if (detail) {
      data.envs[0] = new Env(undefined, "SSH_KEY", detail?.sshKey);
    }
  }}
/>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Virtual Machine</h4>
    <hr />

    {#if loading || (logs !== null && logs.type === "VM")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully deployed VM."
        deployed={true}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy VM."} />
    {:else}
      <Tabs bind:active {tabs} />

      {#if active === "config"}
        <Input
          bind:data={data.name}
          bind:invalid={nameField.invalid}
          field={nameField}
        />

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
          {#if field.invalid !== undefined}
            <Input
              bind:data={data[field.symbol]}
              bind:invalid={field.invalid}
              {field}
            />
          {:else}
            <Input bind:data={data[field.symbol]} {field} />
          {/if}
        {/each}

        <SelectNodeId
          publicIp={data.publicIp}
          cpu={data.cpu}
          memory={data.memory}
          ssd={data.disks.reduce(
            (total, disk) => total + disk.size,
            data.rootFsSize
          )}
          bind:nodeSelection={data.selection.type}
          bind:data={data.nodeId}
          filters={data.selection.filters}
          bind:status
          {profile}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
          nodes={data.selection.nodes}
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
{#if modalData}
  <Modal data={modalData} on:closed={() => (modalData = null)} />
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import "../../assets/global.scss";
</style>
