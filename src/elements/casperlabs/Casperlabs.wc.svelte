<svelte:options tag="tf-casperlabs" />

<script lang="ts">
  // Types
  import type { IFormField, IPackage, ITab } from "../../types";
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
  import AlertDetailed from "../../components/AlertDetailed.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, { isInvalid } from "../../utils/validateName";
  import validateDomainName from "../../utils/validateDomainName";

  import { noActiveProfile } from "../../utils/message";
  import SelectCapacity from "../../components/SelectCapacity.svelte";

  let data = new Casperlabs();

  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024 * 4, diskSize: 100 },
    { name: "Standard", cpu: 2, memory: 1024 * 16, diskSize: 500 },
    { name: "Recommended", cpu: 4, memory: 1024 * 32, diskSize: 1000 },
  ];

  data.disks = [new Disk()];
  let profile: IProfile;
  let active: string = "base";
  let loading = false;
  let success = false;
  let failed = false;

  const tabs: ITab[] = [{ label: "Base", value: "base" }];

  const nameField: IFormField = { label: "Name", placeholder: "Casperlabs Instance Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore

  let message: string;
  let modalData: Object;
  let status: "valid" | "invalid";

  const deploymentStore = window.configs?.deploymentStore;

  let diskField: IFormField;
  let cpuField: IFormField;
  let memoryField: IFormField;

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || isInvalid([nameField, memoryField, diskField, cpuField]); // prettier-ignore
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
    deployCasperlabs(data, profile)
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
      data.envs[0] = new Env(undefined, "SSH_KEY", detail?.sshKey);
    }
  }}
/>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Casperlabs Instance</h4>
    <p>
      Casper Network is a blockchain protocol built from the ground up to remain true to core Web3 principles and adapt to the needs of our evolving world.
      <a
        target="_blank"
        href="https://library.threefold.me/info/manual/#/manual__weblets_casper"
      >
        Quick start documentation</a
      >
    </p>
    <hr />

    {#if loading || (logs !== null && logs.type === "VM")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully deployed casperlabs."
        deployed={true}
      />
    {:else if failed}
      <Alert
        type="danger"
        message={message || "Failed to deploy casperlabs."}
      />
    {:else}
      <Tabs bind:active {tabs} />

      {#if active === "base"}
        <Input
          bind:data={data.name}
          bind:invalid={nameField.invalid}
          field={nameField}
        />

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
          ssd={data.disks.reduce((total, disk) => total + disk.size, 0)}
          bind:nodeSelection={data.selection.type}
          bind:data={data.nodeId}
          filters={data.selection.filters}
          bind:status
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
