<svelte:options tag="tf-subsquid" />

<script lang="ts">
  import Subsquid from "../../types/subsquid";
  import {
    IFormField,
    IPackage,
    ITab,
    SelectCapacityUpdate,
  } from "../../types";
  import deploySubsquid from "../../utils/deploySubsquid";
  import { Disk } from "../../types/vm";

  // Components
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

  let data = new Subsquid();
  const activeProfile = window.configs.activeProfileStore;
  $: profile = $activeProfile;
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
  let modalData: Object;

  async function deploySubsquidHandler() {
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

    deploySubsquid(data, profile, gateway)
      .then((data) => {
        modalData = data.deploymentInfo;
        deploymentStore.set(0);
        success = true;
      })
      .catch((err: string) => {
        failed = true;
        message = err;
      })
      .finally(() => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;
</script>

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={deploySubsquidHandler}>
    <h4 class="is-size-4 mb-4">Deploy a Subsquid Archive(s)</h4>
    <p>
      Subsquid indexer is a piece of software that reads all the blocks from a
      Substrate based blockchain, decodes and stores them for processing in a
      later stage.
      <a
        target="_blank"
        href="https://library.threefold.me/info/manual/#/manual__weblets_subsquid"
      >
        Quick start documentation</a
      >
    </p>

    <hr />

    {#if loading || (logs !== null && logs.type === "Subsquid")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully Deployed Subsquid."
        deployed={true}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to Deploy Subsquid."} />
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
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
          nodes={data.selection.nodes}
        />
      {/if}
    {/if}

    <DeployBtn
      {disabled}
      {loading}
      {success}
      {failed}
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
