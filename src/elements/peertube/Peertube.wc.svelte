<svelte:options tag="tf-peertube" />

<script lang="ts">
  // Types
  import type { IFormField, ITab, IPackage } from "../../types";
  import type { IProfile } from "../../types/Profile";
  // Modules
  import { Disk, Env } from "../../types/vm";
  import Peertube from "../../types/peertube";
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
    validateMemory,
    validateEmail,
    validatePassword
  } from "../../utils/validateName";

  import { noActiveProfile } from "../../utils/message";
  import rootFs from "../../utils/rootFs";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  // Values

  const tabs: ITab[] = [{ label: "Base", value: "base" }];

  const fields: IFormField[] = [
    { label: "Name", placeholder: "Peertube Instance Name", symbol: "name", type: "text", validator: validateName, invalid: false }, // prettier-ignore
    { label: "Email", placeholder: "Admin Email", symbol: "adminEmail", type: "text", validator: validateEmail, invalid: false }, // prettier-ignore
    { label: "Password", placeholder: "Admin Password", symbol: "adminPassword", type: "password", validator: validatePassword, invalid: false }, // prettier-ignore
  ];

  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024, diskSize: 100 },
    { name: "Standard", cpu: 2, memory: 1024 * 2, diskSize: 250 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 500 },
  ];

  const deploymentStore = window.configs?.deploymentStore;
  let data = new Peertube();

  let active: string = "base";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  let message: string;
  let modalData: Object;
  let status: "valid" | "invalid";

  let diskField: IFormField;
  let cpuField: IFormField;
  let memoryField: IFormField;

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || isInvalid([...fields, diskField, memoryField, cpuField]); // prettier-ignore
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
      .then((data) => {
        deploymentStore.set(0);
        success = true;
        modalData = data.deploymentInfo;
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
    <p>
      Peertube aspires to be a decentralized and free/libre alternative to video broadcasting services.
      <a
        target="_blank"
        href="https://library.threefold.me/info/manual/#/manual__weblets_peertube"
      >
        Quick start documentation</a
      >
    </p>
    <hr />

    <!-- Status -->
    {#if loading || (logs !== null && logs.type === "Peertube")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully deployed a Peertube instance"
        deployed={true}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy VM."} />
    {:else}
      <Tabs bind:active {tabs} />

      {#if active === "base"}
        {#each fields as field (field.symbol)}
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

        <SelectCapacity
          bind:cpu={data.cpu}
          bind:memory={data.memory}
          bind:diskSize={data.disks[0].size}
          bind:diskField={diskField}
          bind:cpuField={cpuField}
          bind:memoryField={memoryField}
          {packages}
        />

        <SelectNodeId
          publicIp={data.publicIp}
          cpu={data.cpu}
          memory={data.memory}
          ssd={data.disks.reduce(
            (total, disk) => total + disk.size,
            rootFs(data.cpu, data.memory)
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
