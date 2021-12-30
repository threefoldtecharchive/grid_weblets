<svelte:options tag="tf-peertube" />

<script lang="ts">
  // Types
  import type { IFormField, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";
  // Modules
  import VM, { Disk, Env } from "../../types/vm";
  import deployPeertube from "../../utils/deployPeertube";
  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import AlertDetailed from "../../components/AlertDetailed.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, {
    isInvalid,
    validateCpu,
    validateDisk,
    validateMemory,
  } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";

  // Values

  const tabs: ITab[] = [{ label: "Base", value: "base" }];
  const nameField: IFormField = { label: "Name", placeholder: "Peertube Instance Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "CPU", symbol: "cpu", placeholder: "CPU Cores", type: "number", validator: validateCpu, invalid: false },
    { label: "Memory (MB)", symbol: "memory", placeholder: "Your Memory in MB", type: "number", validator: validateMemory, invalid: false }
  ];

  const diskField: IFormField = {
    label: "Disk (GB)",
    symbol: "disk",
    placeholder: "Your Disk size in GB",
    type: "number",
    validator: validateDisk,
    invalid: false,
  };

  const deploymentStore = window.configs?.deploymentStore;
  let data = new VM(); // set the default specs for peertube
  data.cpu = 2;
  data.memory = 2048;
  data.disks = [new Disk(undefined, undefined, 20, undefined)];

  let active: string = "base";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  let message: string;
  let modalData: Object;
  let status: "valid" | "invalid";
  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || nameField.invalid || status !== "valid" || isInvalid(baseFields) || diskField.invalid; // prettier-ignore
  let domain: string, planetaryIP: string;
  const currentDeployment = window.configs?.currentDeploymentStore;

  async function onDeployVM() {
    loading = true;
    success = false;
    failed = false;
    message = undefined;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message =
        "No enough balance to execute! Transaction requires 2 TFT at least in your wallet.";
      return;
    }
    deployPeertube(data, profile)
      .then(({ domain: d, planetaryIP: ip }) => {
        deploymentStore.set(0);
        success = true;
        domain = d;
        planetaryIP = ip;
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
      data.envs[0] = new Env(undefined, "SSH_KEY", detail.sshKey);
    }
  }}
/>

<div style="padding: 15px;">
  <!-- Container -->
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Peertube Instance</h4>
    <hr />

    <!-- Status -->
    {#if loading || (logs !== null && logs.type === "Peertube")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <AlertDetailed
        type="success"
        message="Successfully deployed a Peertube instance"
        {planetaryIP}
        {domain}
        deployed={true}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy VM."} />
    {:else}
      <Tabs bind:active {tabs} />

      {#if active === "base"}
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
        <Input bind:data={data.disks[0].size} field={diskField} />

        <SelectNodeId
          publicIp={false}
          cpu={data.cpu}
          memory={data.memory}
          ssd={data.disks.reduce(
            (total, disk) => total + disk.size,
            data.rootFsSize
          )}
          bind:data={data.nodeId}
          bind:nodeSelection={data.selection.type}
          bind:status
          filters={data.selection.filters}
          {profile}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
          nodes={data.selection.nodes}
        />
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
</style>
