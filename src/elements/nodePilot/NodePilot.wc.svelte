<svelte:options tag="tf-nodepilot" />

<script lang="ts">
  import { Disk, Env } from "../../types/vm";
  import NodePilot from "../../types/nodepilot";

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
    validateNPCpu,
    validateFlistvalue,
    validateKey,
    validateKeyValue,
    validateNPMemory,
  } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";

  const tabs: ITab[] = [{ label: "Config", value: "config" }];

  let data = new NodePilot();

  // prettier-ignore
  let baseFields: IFormField[] = [
    { label: "CPU (vCores)", symbol: 'cpu', placeholder: 'CPU vCores', type: 'number', validator: validateNPCpu, invalid: false},
    { label: "Memory (MB)", symbol: 'memory', placeholder: 'Your Memory in MB', type: 'number', validator: validateNPMemory, invalid: false },
    ];

  const nameField: IFormField = { label: "Name", placeholder: "Node Pilot Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore

  // prettier-ignore
  const flists: IFlist[] = [
    { name: "nodepilot", url: "https://hub.grid.tf/tf-official-vms/node-pilot-zdbfs.flist", entryPoint: "/" },
    
  ];

  $: {
    data.flist = flists[0].url;
    data.entrypoint = flists[0].entryPoint;
    data.cpu = 8;
    data.memory = 1024 * 8;
    data.publicIp = true;
    data.publicIp6 = true;
    data.planetary = false;

    let disk1 = new Disk();
    disk1.size = 15;
    let disk2 = new Disk();
    disk2.size = 100;
    data.disks = [disk1, disk2];
  }

  // prettier-ignore
  const envFields: IFormField[] = [
    { label: 'Key', symbol: 'key', placeholder: "Environment Key", type: "text", validator: validateKey, invalid:false},
    { label: 'Value', symbol: 'value', placeholder: "Environment Value", validator: validateKeyValue,type: "text" },
  ];

  const deploymentStore = window.configs?.deploymentStore;
  let active: string = "config";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;

  let message: string;
  let modalData: Object;
  let status: "valid" | "invalid";

  function _isInvalidDisks() {
    const mounts = data.disks.map(({ mountpoint }) => mountpoint.replaceAll("/", "")); // prettier-ignore
    const mountSet = new Set(mounts);

    const names = data.disks.map(({ name }) => name.trim());
    const nameSet = new Set(names);
    return mounts.length !== mountSet.size || names.length !== nameSet.size;
  }

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || validateFlist.invalid || nameField.invalid || isInvalid([...baseFields,...envFields]) || _isInvalidDisks(); // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;
  const validateFlist = {
    loading: false,
    error: null,
    validator: validateFlistvalue,
    invalid: false,
  };

  async function onDeployNodePilot() {
    loading = true;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message =
        "No enough balance to execute transaction requires 2 TFT at least in your wallet.";
      return;
    }

    success = false;
    failed = false;
    message = undefined;

    deployVM(data, profile, "NodePilot")
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
        validateFlist.loading = false;
        loading = false;
      });
  }

  function validateMountPoint({ id, mountpoint }: Disk) {
    const disks = data.disks;
    const valid = disks.reduce((v, disk) => {
      if (disk.id === id) return v;
      return v && disk.mountpoint.replaceAll("/", "") !== mountpoint.replaceAll("/", ""); // prettier-ignore
    }, true);
    return valid ? null : "Disks can't have duplicated mountpoint.";
  }

  function validateDiskName({ id, name }: Disk) {
    if (!name) return "Disk name is required";
    const valid = data.disks.reduce((v, disk) => {
      if (disk.id === id) return v;
      return v && disk.name.trim() !== name.trim();
    }, true);
    return valid ? null : "Disks can't have duplicated name.";
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
  <form on:submit|preventDefault={onDeployNodePilot} class="box">
    <h4 class="is-size-4">Deploy a Node Pilot</h4>
    <p>
      Deploy a new Node Pilot on the Threefold Grid
      <a
        target="_blank"
        href="https://library.threefold.me/info/manual/#/manual__weblets_nodepilot"
      >
        Quick start documentation</a
      >
    </p>
    <hr />

    {#if loading || (logs !== null && logs.type === "NodePilot")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully deployed Node pilot."
        deployed={true}
      />
    {:else if failed}
      <Alert
        type="danger"
        message={message || "Failed to deploy Node pilot."}
      />
    {:else}
      <Tabs bind:active {tabs} />

      {#if active === "config"}
        <Input
          bind:data={data.name}
          bind:invalid={nameField.invalid}
          field={nameField}
        />

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
            data.rootFs
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
              {#each disk.diskFields as field (field.symbol)}
                {#if field.symbol === "mountpoint"}
                  <Input
                    bind:data={disk[field.symbol]}
                    field={{
                      ...field,
                      error:
                        !field.invalid && !field.error
                          ? validateMountPoint(disk)
                          : null,
                    }}
                  />
                {:else if field.symbol === "name"}
                  <Input
                    bind:data={disk[field.symbol]}
                    field={{
                      ...field,
                      error: validateDiskName(disk),
                    }}
                  />
                {:else}
                  <Input
                    bind:data={disk[field.symbol]}
                    {field}
                    bind:invalid={field.invalid}
                  />
                {/if}
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    {/if}

    <DeployBtn
      disabled={disabled || validateFlist.loading}
      loading={loading || validateFlist.loading}
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
