<svelte:options tag="tf-umbrel" />

<script lang="ts">
  import Umbrel from "../../types/umbrel";
  import type { IProfile } from "../../types/Profile";
  import { IFormField, IPackage, ITab, SelectCapacityUpdate } from "../../types";
  import deployUmbrel from "../../utils/deployUmbrel";
  import { Disk } from "../../types/vm";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import Modal from "../../components/DeploymentModal.svelte";

  //util
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, { isInvalid, validateUmbrelPassword } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";
  import rootFs from "../../utils/rootFs";

  let data = new Umbrel();
  data.disks = [new Disk()];
  let profile: IProfile;

  let loading = false;
  let success = false;
  let failed = false;

  let status: "valid" | "invalid";
  let active = "config";

  const deploymentStore = window.configs?.deploymentStore;
  const currentDeployment = window.configs?.currentDeploymentStore;

  $: disabled = ((loading || !data.valid) && !(success || failed))  || !profile || status !== "valid" || selectCapacity.invalid || isInvalid([...fields]); // prettier-ignore

  let message: string;
  let modalData: object;

  const tabs: ITab[] = [{ label: "Config", value: "config" }];
  let fields: IFormField[] = [
    {
      label: "Name",
      symbol: "name",
      placeholder: "Umbrel Instance Name",
      type: "text",
      validator: validateName,
      invalid: false,
    },
    {
      label: "Username",
      symbol: "username",
      placeholder: "will be used to create Umbrel dashboard account.",
      type: "text",
      validator: validateName,
      invalid: true,
    },
    {
      label: "Password",
      symbol: "password",
      placeholder: "Will be used to login to the Umbrel dashboard",
      type: "password",
      validator: validateUmbrelPassword,
      invalid: false,
    },
    { label: "Public IP", symbol: "publicIp", placeholder: "Enable Public Ip", type: "checkbox" },
  ];
  // define this solution packages
  let selectCapacity = new SelectCapacityUpdate();
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 2, memory: 1024 * 2, diskSize: 10 },
    { name: "Standard", cpu: 2, memory: 1024 * 4, diskSize: 50 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 100 },
  ];

  async function deployUmbrelHandler() {
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

    deployUmbrel(data, profile)
      .then((data: any) => {
        modalData = data;
        deploymentStore.set();
        success = true;
      })
      .catch((err: string) => {
        failed = true;
        message = normalizeDeploymentErrorMessage(err, "Umbrel");
      })
      .finally(() => {
        loading = false;
      });
  }
  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "Umbrel");
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
  <form class="box" on:submit|preventDefault={deployUmbrelHandler}>
    <h4 class="is-size-4 mb-4">Deploy an Umbrel Instance</h4>
    <p>
      Umbrel is an OS for running a personal server in your home. Self-host open source apps like Nextcloud, Bitcoin
      node, and more.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_umbrel.html"> Quick start documentation</a>
    </p>
    <hr />

    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed Umbrel." deployed={true} />
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
      <SelectNodeId
        cpu={data.cpu}
        memory={data.memory}
        publicIp={data.publicIp}
        ssd={data.diskSize + 10 + rootFs(data.cpu, data.memory)}
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
  @import "../../assets/global.scss";
</style>
