<svelte:options tag="tf-validator" />

<script lang="ts">
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Input from "../../components/Input.svelte";
  import SelectProfile from "../../components/SelectProfile.svelte";
  import type { IFormField, IPackage, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";

  import Modal from "../../components/DeploymentModal.svelte";
  import TFhubValidator from "../../types/TFhubValidator";
  import Alert from "../../components/Alert.svelte";
  import { noActiveProfile } from "../../utils/message";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import deployTFhubValidator from "../../utils/deployTFhubValidator";
  import validateName, {
    isInvalid,
    validateStakeAmount,
    validateBSCAddress,
    validateBSCPrivateKey,
    validateethereumRpc,
  } from "../../utils/validateName";
  import { syncValidateMnemonics } from "../../utils/validateMnemonics";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import rootFs from "../../utils/rootFs";
  import Tabs from "../../components/Tabs.svelte";

  const currentDeployment = window.configs?.currentDeploymentStore;
  const deploymentStore = window.configs?.deploymentStore;
  const data = new TFhubValidator();

  const tabs: ITab[] = [
    { label: "Base", value: "base" },
    { label: "Config", value: "valConf" },
  ];
  let active = "base";

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: "name", type: "text", placeholder: "Validator Instance Name", validator: validateName, invalid: false },
  ];

  const valConf: IFormField[] = [
    {
      label: "Mnemonics",
      symbol: "mnemonics",
      type: "password",
      placeholder: "For the cosmos account that will stake token.",
      validator: syncValidateMnemonics,
      invalid: false,
    },
    {
      label: "Stake Amount (TFT)",
      symbol: "stakeAmount",
      type: "text",
      placeholder: "1 = 10000000TFT in Keplr",
      invalid: false,
      validator: validateStakeAmount,
    },
    {
      label: "Ethereum Address",
      symbol: "ethereumAddress",
      type: "text",
      placeholder: "This address will be used in the bridge.",
      invalid: false,
      validator: validateBSCAddress,
    },
    {
      label: "Ethereum Private Key",
      symbol: "ethereumPrivKey",
      type: "password",
      placeholder: "The private key of the previous address.",
      invalid: false,
      validator: validateBSCPrivateKey,
    },
    {
      label: "Ethereum rpc (URL)",
      symbol: "ethereumRpc",
      type: "text",
      placeholder: "You'r full Ethereum node or we will use one of Threefold.",
      invalid: false,
      validator: validateethereumRpc,
    },
  ];
  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024 * 2, diskSize: 50 },
    { name: "Standard", cpu: 2, memory: 1024 * 4, diskSize: 100 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 150 },
  ];

  let profile: IProfile;
  let loading: boolean = false;
  let failed: boolean = false;
  let success: boolean = false;
  let message: string;

  let diskField: IFormField;
  let cpuField: IFormField;
  let memoryField: IFormField;
  let modalData: Object;

  $: disabled =
    data.invalid ||
    data.status !== "valid" ||
    isInvalid([...baseFields, ...valConf, diskField, memoryField, cpuField]);

  function onDeployTFhubValidator() {
    loading = true;
    deployTFhubValidator(profile, data)
      .then((data) => {
        modalData = data;
        deploymentStore.set(0);
        success = true;
      })
      .catch((err) => {
        console.log("Error", err);
        failed = true;
        message = err.message || err;
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
      data.ssh_key = detail?.sshKey;
    }
  }}
/>

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={onDeployTFhubValidator}>
    <h4 class="is-size-4">Deploy a TFhub Validator Instance</h4>
    <p>
      TFhub Validator A single point of collaboration. Designed specifically for
      digital operations.
      <a
        target="_blank"
        href="https://library.threefold.me/info/manual/#/manual__weblets_TFhubValidator"
      >
        Quick start documentation
      </a>
    </p>
    <hr />
    {#if loading || (logs !== null && logs.type === "VM")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully deployed TFhubValidator."
        deployed={true}
      />
    {:else if failed}
      <Alert
        type="danger"
        message={message || "Failed to deploy TFhubValidator."}
      />
    {:else}
      <Tabs {tabs} bind:active />
      {#if active === "base"}
        {#each baseFields as field (field.symbol)}
          <Input
            bind:data={data[field.symbol]}
            bind:invalid={field.invalid}
            {field}
          />
        {/each}
        <SelectCapacity
          bind:cpu={data.cpu}
          bind:memory={data.memory}
          bind:diskSize={data.disks[0].size}
          bind:diskField
          bind:cpuField
          bind:memoryField
          {packages}
        />
        <SelectNodeId
          bind:data={data.nodeId}
          bind:status={data.status}
          bind:nodeSelection={data.selection.type}
          {profile}
          cpu={data.cpu}
          ssd={data.disks.reduce(
            (total, disk) => total + disk.size,
            rootFs(data.cpu, data.memory)
          )}
          memory={data.memory}
          publicIp={data.publicIp}
          nodes={data.selection.nodes}
          filters={data.selection.filters}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
        />
      {:else if active === "valConf"}
        <div class="notification is-warning is-light">
          <p>please provide the required values for the validator</p>
        </div>
        {#each valConf as field (field.symbol)}
          <Input
            bind:data={data[field.symbol]}
            bind:invalid={field.invalid}
            {field}
          />
        {/each}
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
