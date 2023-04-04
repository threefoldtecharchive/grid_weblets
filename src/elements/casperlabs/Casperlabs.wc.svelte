<svelte:options tag="tf-casperlabs" />

<script lang="ts">
  // Types
  import { IFormField, IPackage, ITab, SelectCapacityUpdate } from "../../types";
  import type { IProfile } from "../../types/Profile";
  import { Disk, Env } from "../../types/vm";
  import Casperlabs from "../../types/casperlabs";
  // Modules
  import deployCasperlabs from "../../utils/deployCasperlabs";
  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import SelectGatewayNode from "../../components/SelectGatewayNode.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, { isInvalid } from "../../utils/validateName";

  import { noActiveProfile } from "../../utils/message";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import type { GatewayNodes } from "../../utils/gatewayHelpers";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";

  let data = new Casperlabs();
  let invalid = true;
  let gateway: GatewayNodes;

  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024 * 4, diskSize: 100 },
    { name: "Standard", cpu: 2, memory: 1024 * 16, diskSize: 500 },
    { name: "Recommended", cpu: 4, memory: 1024 * 32, diskSize: 1000 },
  ];
  let selectCapacity = new SelectCapacityUpdate();

  data.disks = [new Disk()];
  let profile: IProfile;
  let active = "base";
  let loading = false;
  let success = false;
  let failed = false;

  const tabs: ITab[] = [{ label: "Base", value: "base" }];

  const nameField: IFormField = { label: "Name", placeholder: "Casperlabs Instance Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore

  let message: string;
  let modalData: object;
  let status: "valid" | "invalid";

  const deploymentStore = window.configs?.deploymentStore;

  $: disabled = ((loading || !data.valid) && !(success || failed)) || invalid || !profile || status !== "valid" || selectCapacity.invalid || isInvalid([nameField]); // prettier-ignore
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
    deployCasperlabs(data, profile, gateway)
      .then(data => {
        deploymentStore.set(0);
        success = true;
        modalData = data.deploymentInfo;
      })
      .catch((err: string) => {
        failed = true;
        message = normalizeDeploymentErrorMessage(err, "Casperlabs");
      })
      .finally(() => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "Casperlabs");
  $: showNoProfile = !showLogs && !profile;
  $: showSuccess = !showLogs && !showNoProfile && success;
  $: showFailed = !showLogs && !showNoProfile && failed;
  $: showContent = !showLogs && !showNoProfile && !showSuccess && !showFailed;
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
    <h4 class="is-size-4">Deploy a Casperlabs Instance</h4>
    <p>
      Casper Network is a blockchain protocol built from the ground up to remain true to core Web3 principles and adapt
      to the needs of our evolving world.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_casper.html"> Quick start documentation</a>
    </p>
    <hr />

    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed Casperlabs." deployed={true} />
    </div>

    <div style:display={showFailed ? "block" : "none"}>
      <Alert type="danger" {message} />
    </div>

    <div style:display={showContent ? "block" : "none"}>
      <Tabs bind:active {tabs} />

      <Input bind:data={data.name} bind:invalid={nameField.invalid} field={nameField} />

      <SelectCapacity
        {packages}
        selectedPackage={selectCapacity.selectedPackage}
        cpu={data.cpu}
        memory={data.memory}
        diskSize={data.diskSize}
        on:update={({ detail }) => {
          selectCapacity = detail;
          if (!detail.invalid) {
            const { cpu, memory, diskSize } = detail.package;
            data.cpu = cpu;
            data.memory = memory;
            data.diskSize = diskSize;
          }
        }}
      />
      <SelectGatewayNode bind:gateway bind:invalid />

      <SelectNodeId
        publicIp={data.publicIp}
        cpu={data.cpu}
        memory={data.memory}
        ssd={data.disks.reduce((total, disk) => total + disk.size, 0)}
        bind:nodeSelection={data.selection.type}
        bind:data={data.nodeId}
        filters={data.selection.filters}
        bind:status
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
