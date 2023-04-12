<svelte:options tag="tf-peertube" />

<script lang="ts">
  // Types
  import { IFormField, ITab, IPackage, SelectCapacityUpdate } from "../../types";
  import type { IProfile } from "../../types/Profile";
  // Modules
  import { Env } from "../../types/vm";
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
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, { isInvalid, validateEmail, validatePassword } from "../../utils/validateName";

  import { noActiveProfile } from "../../utils/message";
  import rootFs from "../../utils/rootFs";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import type { GatewayNodes } from "../../utils/gatewayHelpers";
  import SelectGatewayNode from "../../components/SelectGatewayNode.svelte";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";
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
  let selectCapacity = new SelectCapacityUpdate();

  const deploymentStore = window.configs?.deploymentStore;
  let data = new Peertube();

  let active = "base";
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;
  let message: string;
  let modalData: object;
  let status: "valid" | "invalid";

  let gateway: GatewayNodes;
  let invalid = true;

  $: disabled = ((loading || !data.valid) && !(success || failed)) || invalid || !profile || status !== "valid" || selectCapacity.invalid || isInvalid([...fields]); // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;

  async function onDeployVM() {
    loading = true;
    success = false;
    failed = false;
    message = undefined;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message = "No enough balance to execute! Transaction requires 2 TFT at least in your wallet.";
      return;
    }
    deployPeertube(data, profile, gateway)
      .then(data => {
        deploymentStore.set(0);
        success = true;
        modalData = data.deploymentInfo;
      })
      .catch((err: string) => {
        failed = true;
        message = normalizeDeploymentErrorMessage(err, "Peertube");
      })
      .finally(() => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "Peertube");
  $: showNoProfile = !showLogs && !profile;
  $: showSuccess = !showLogs && !showNoProfile && success;
  $: showFailed = !showLogs && !showNoProfile && failed;
  $: showContent = !showLogs && !showNoProfile && !showSuccess && !showFailed;
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
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_peertube.html"> Quick start documentation</a>
    </p>
    <hr />

    <!-- Status -->
    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed Peertube." deployed={true} />
    </div>

    <div style:display={showFailed ? "block" : "none"}>
      <Alert type="danger" {message} />
    </div>

    <div style:display={showContent ? "block" : "none"}>
      <Tabs bind:active {tabs} />

      {#each fields as field (field.symbol)}
        {#if field.invalid !== undefined}
          <Input bind:data={data[field.symbol]} bind:invalid={field.invalid} {field} />
        {:else}
          <Input bind:data={data[field.symbol]} {field} />
        {/if}
      {/each}

      <SelectCapacity
        {packages}
        selectedPackage={selectCapacity.selectedPackage}
        cpu={data.cpu}
        memory={data.memory}
        diskSize={data.disks[0].size}
        on:update={({ detail }) => {
          selectCapacity = detail;
          if (!detail.invalid) {
            const { cpu, memory, diskSize } = detail.package;
            data.cpu = cpu;
            data.memory = memory;
            data.disks[0].size = diskSize;
          }
        }}
      />
      <SelectGatewayNode bind:gateway bind:invalid />

      <SelectNodeId
        publicIp={data.publicIp}
        cpu={data.cpu}
        memory={data.memory}
        ssd={data.disks.reduce((total, disk) => total + disk.size, rootFs(data.cpu, data.memory))}
        bind:data={data.nodeId}
        bind:nodeSelection={data.selection.type}
        bind:status
        filters={data.selection.filters}
        {profile}
        on:fetch={({ detail }) => (data.selection.nodes = detail)}
        nodes={data.selection.nodes}
      />
    </div>

    <DeployBtn
      {disabled}
      {loading}
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
</style>
