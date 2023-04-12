<svelte:options tag="tf-subsquid" />

<script lang="ts">
  import Subsquid from "../../types/subsquid";
  import type { IProfile } from "../../types/Profile";
  import { IFormField, IPackage, ITab, SelectCapacityUpdate } from "../../types";
  import deploySubsquid from "../../utils/deploySubsquid";
  import { Disk } from "../../types/vm";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import Modal from "../../components/DeploymentModal.svelte";

  // utils
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, { isInvalid ,validateEndpoint} from "../../utils/validateName"; // prettier-ignore
  import { noActiveProfile } from "../../utils/message";
  import SelectGatewayNode from "../../components/SelectGatewayNode.svelte";
  import type { GatewayNodes } from "../../utils/gatewayHelpers";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";

  let data = new Subsquid();
  let profile: IProfile;
  let gateway: GatewayNodes;

  let loading = false;
  let success = false;
  let failed = false;
  let invalid = true;

  let status: "valid" | "invalid";

  const deploymentStore = window.configs?.deploymentStore;
  const currentDeployment = window.configs?.currentDeploymentStore;

  data.disks = [new Disk()];

  // define this solution packages

  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024, diskSize: 50 },
    { name: "Standard", cpu: 2, memory: 1024 * 2, diskSize: 100 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 250 },
  ];
  let selectCapacity = new SelectCapacityUpdate();

  const tabs: ITab[] = [{ label: "Base", value: "base" }];
  let active = "base";

  // Fields
  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Subsquid Instance Name", type: "text", validator: validateName, invalid: false },
    { label: "Websocket Endpoint", symbol: "endPoint", placeholder: "A substrate based chain websocket endpoint", type: "text",validator: validateEndpoint,  invalid: false},
    { label: "Public IP", symbol: "publicIp", placeholder: "Enable Public Ip", type: 'checkbox' },
  ];

  $: disabled = ((loading || !data.valid) && !(success || failed)) || invalid || !profile || status !== "valid" || selectCapacity.invalid || isInvalid([...fields]); // prettier-ignore

  let message: string;
  let modalData: object;

  async function deploySubsquidHandler() {
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

    deploySubsquid(data, profile, gateway)
      .then(data => {
        modalData = data.deploymentInfo;
        deploymentStore.set(0);
        success = true;
      })
      .catch((err: string) => {
        failed = true;
        message = normalizeDeploymentErrorMessage(err, "Subsquid");
      })
      .finally(() => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "Subsquid");
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
  <form class="box" on:submit|preventDefault={deploySubsquidHandler}>
    <h4 class="is-size-4 mb-4">Deploy a Subsquid Archive(s)</h4>
    <p>
      Subsquid indexer is a piece of software that reads all the blocks from a Substrate based blockchain, decodes and
      stores them for processing in a later stage.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_subsquid.html"> Quick start documentation</a>
    </p>

    <hr />

    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed Subsquid." deployed={true} />
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
        cpu={data.cpu}
        memory={data.memory}
        publicIp={data.publicIp}
        ssd={data.disks.reduce((total, disk) => total + disk.size, 0)}
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
      {success}
      {failed}
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
