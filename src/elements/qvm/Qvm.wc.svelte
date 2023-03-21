<svelte:options tag="tf-qvm" />

<script lang="ts">
  import VM, { Env } from "../../types/vm";
  import QSFS from "../../types/qsfs";
  import type { IFormField, ITab } from "../../types";
  import deployQVM from "../../utils/deployQVM";
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
    validateDiskName,
    validateFlistvalue,
    validateKey,
    validateKeyValue,
    validateMemory,
    validateMountPoint,
    validateQsfsSecret,
    validateZdbCount,
  } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";
  import isInvalidFlist from "../../utils/isInvalidFlist";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";

  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Environment Variables", value: "env" },
    { label: "QSFS", value: "qsfs" },
  ];

  let data = new VM();
  let qsfs = new QSFS();
  data.name = "QVM" + data.id.split("-")[0];
  data.cpu = 1;
  data.memory = 2048;

  // prettier-ignore
  let baseFields: IFormField[] = [
    { label: "CPU (vCores)", symbol: 'cpu', placeholder: 'CPU vCores', type: 'number', validator: validateCpu, invalid: false, disabled: true},
    { label: "Memory (MB)", symbol: 'memory', placeholder: 'Your Memory in MB', type: 'number', validator: validateMemory, invalid: false, disabled: true},
    { label: "Public IPv4", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Public IPv6", symbol: "publicIp6", placeholder: "", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "", type: 'checkbox' },
  ];
  const qsfsFields: IFormField[] = [
    {
      label: "Name",
      symbol: "name",
      placeholder: "Enter QSFS name",
      type: "text",
      validator: validateName && validateDiskName,
      invalid: false,
    },
    {
      label: "Secret",
      symbol: "secret",
      placeholder: "Enter QSFS secret",
      type: "password",
      validator: validateQsfsSecret,
    },
    {
      label: "Count",
      symbol: "count",
      placeholder: "How many ZDBs needed?",
      type: "number",
      validator: validateZdbCount,
      invalid: false,
    },
    {
      label: "Disk size (GB) ",
      symbol: "disk",
      placeholder: "Disk size of each ZDB in GB",
      type: "number",
      validator: validateDisk,
      invalid: false,
    },
    {
      label: "Number of Nodes",
      symbol: "nodes",
      placeholder: "Number of Nodes to deploy on",
      type: "number",
      invalid: false,
    },
    {
      label: "Mount Point",
      symbol: "mountpoint",
      placeholder: "Disk Mount Point",
      type: "text",
      validator: validateMountPoint,
      invalid: false,
    },
  ];
  const nameField: IFormField = { label: "Name", placeholder: "Virtual Machine Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore

  // prettier-ignore
  const flistField: IFormField = { label: "VM Image", placeholder: "Ubuntu-22.04", symbol: "flist", type: "text", disabled:true}; // prettier-ignore
  let selectedFlist = 0;
  let flistSelectValue = "Ubuntu-22.04";

  // prettier-ignore
  const envFields: IFormField[] = [
    { label: 'Key', symbol: 'key', placeholder: "Environment Key", type: "text", validator: validateKey, invalid:false},
    { label: 'Value', symbol: 'value', placeholder: "Environment Value", validator: validateKeyValue,type: "text" },
  ];

  const deploymentStore = window.configs?.deploymentStore;
  let active = "config";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  let message: string;
  let modalData: object;
  let status: "valid" | "invalid";

  function _isInvalidDisks() {
    const mounts = data.disks.map(({ mountpoint }) => mountpoint.replaceAll("/", "")); // prettier-ignore
    const mountSet = new Set(mounts);
    const names = data.disks.map(({ name }) => name.trim());
    const nameSet = new Set(names);
    return mounts.length !== mountSet.size || names.length !== nameSet.size;
  }
  $: disabled = ((loading || !data.valid || !qsfs.valid) && !(success || failed)) || !profile || status !== "valid" || validateFlist.invalid || nameField.invalid || isInvalid([...baseFields,...envFields,...qsfsFields]) || _isInvalidDisks() || !(data.planetary || data.publicIp || data.publicIp6); // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;
  const validateFlist = {
    loading: false,
    error: null,
    validator: validateFlistvalue,
    invalid: false,
  };

  async function onDeployVM() {
    data.qsfsDisk = qsfs;
    if (flistSelectValue === "other") {
      validateFlist.loading = true;
      validateFlist.error = null;

      if (await isInvalidFlist(data.flist)) {
        validateFlist.loading = false;
        validateFlist.error = "Invalid Flist URL.";
        return;
      }
    }

    loading = true;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message = "No enough balance to execute transaction requires 2 TFT at least in your wallet.";
      return;
    }

    success = false;
    failed = false;
    message = undefined;

    deployQVM(data, qsfs, profile)
      .then(data => {
        deploymentStore.set(0);
        success = true;
        modalData = data;
      })
      .catch((err: string) => {
        failed = true;
        message = normalizeDeploymentErrorMessage(err, "QVM");
      })
      .finally(() => {
        validateFlist.loading = false;
        loading = false;
      });
  }

  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "Qvm");
  $: showNoProfile = !showLogs && !profile;
  $: showSuccess = !showLogs && !showNoProfile && success;
  $: showFailed = !showLogs && !showNoProfile && failed;
  $: showContent = !showLogs && !showNoProfile && !showSuccess && !showFailed;
</script>

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
  }}
/>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a QSFS Virtual Machine</h4>
    <p>
      Deploy a new QSFS enabled virtual machine on the Threefold Grid
      <a target="_blank" href="https://library.threefold.me/info/manual/#/manual__weblets_vm">
        Quick start documentation
      </a>
    </p>
    <hr />

    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed Qvm." deployed={true} />
    </div>

    <div style:display={showFailed ? "block" : "none"}>
      <Alert type="danger" {message} />
    </div>

    <div style:display={showContent ? "block" : "none"}>
      <Tabs bind:active {tabs} />
      <section style:display={active === "config" ? null : "none"}>
        <Input bind:data={data.name} bind:invalid={nameField.invalid} field={nameField} />

        <Input
          bind:data={flistSelectValue}
          bind:selected={selectedFlist}
          field={flistField}
          on:input={() => {
            validateFlist.error = null;
          }}
        />
        {#each baseFields as field (field.symbol)}
          {#if field.invalid !== undefined}
            <Input bind:data={data[field.symbol]} bind:invalid={field.invalid} {field} />
          {:else}
            <Input bind:data={data[field.symbol]} {field} />
          {/if}
        {/each}

        <SelectNodeId
          publicIp={data.publicIp}
          cpu={data.cpu}
          memory={data.memory}
          ssd={data.disks.reduce((total, disk) => total + disk.size, data.rootFs)}
          bind:nodeSelection={data.selection.type}
          bind:data={data.nodeId}
          filters={data.selection.filters}
          bind:status
          {profile}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
          nodes={data.selection.nodes}
        />
      </section>
      <section style:display={active === "env" ? null : "none"}>
        <AddBtn on:click={() => (data.envs = [...data.envs, new Env()])} />
        <div class="nodes-container">
          {#each data.envs as env, index (env.id)}
            <div class="box">
              <DeleteBtn name={env.key} on:click={() => (data.envs = data.envs.filter((_, i) => index !== i))} />
              {#each envFields as field (field.symbol)}
                <Input bind:data={env[field.symbol]} {field} />
              {/each}
            </div>
          {/each}
        </div>
      </section>
      <!-- qsfs field-->
      <section style:display={active === "qsfs" ? null : "none"}>
        {#each qsfsFields as field (field.symbol)}
          {#if field.invalid !== undefined}
            <Input bind:data={qsfs[field.symbol]} bind:invalid={field.invalid} {field} />
          {:else}
            <Input bind:data={qsfs[field.symbol]} {field} />
          {/if}
        {/each}

        <SelectNodeId
          memory={null}
          publicIp={null}
          cpu={null}
          multiple={qsfs.nodes}
          count={qsfs.count}
          disk={qsfs.disk}
          ssd={null}
          filters={qsfs.filters}
          {profile}
          on:multiple={e => (qsfs.nodeIds = e.detail)}
        />
      </section>
    </div>

    <DeployBtn
      disabled={disabled || validateFlist.loading}
      loading={loading || validateFlist.loading}
      {failed}
      {success}
      on:click={e => {
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
