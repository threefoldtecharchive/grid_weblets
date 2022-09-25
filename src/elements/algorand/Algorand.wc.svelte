<svelte:options tag="tf-algorand" />

<script lang="ts">
  import Algorand from "../../types/algorand";
  import type { IProfile } from "../../types/Profile";
  import type { IFormField, IPackage, ITab } from "../../types";
  import deployAlgorand from "../../utils/deployAlgorand";
  import rootFs from "../../utils/rootFs";

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
  import validateName, { isInvalid, validateMnemonics, validatePreCode} from "../../utils/validateName"; // prettier-ignore
  import { noActiveProfile } from "../../utils/message";
  import SelectCapacity from "../../components/SelectCapacity.svelte";

  let data = new Algorand();
  let profile: IProfile;

  let loading = false;
  let success = false;
  let failed = false;

  let status: "valid" | "invalid";

  const deploymentStore = window.configs?.deploymentStore;
  const currentDeployment = window.configs?.currentDeploymentStore;

  let diskField: IFormField;
  let cpuField: IFormField;
  let memoryField: IFormField;

  // Tabs
  const tabs: ITab[] = [{ label: "Base", value: "base" }];
  let active = "base";

  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 2, memory: 1024 * 4, diskSize: 50 },
    { name: "Standard", cpu: 4, memory: 1024 * 8, diskSize: 500 },
    { name: "Recommended", cpu: 8, memory: 1024 * 16, diskSize: 1000 },
  ];

  // Fields
  const fields: IFormField[] = [
    {
      label: "Name",
      symbol: "name",
      placeholder: "Algorand Instance Name",
      type: "text",
      validator: validateName,
      invalid: false,
    },
    {
      label: "Public IP",
      symbol: "publicIp",
      placeholder: "Enable Public Ip",
      type: "checkbox",
    },
    {
      label: "Network",
      type: "select",
      symbol: "nodeNetwork",
      options: [
        { label: "Mainnet", value: "mainnet", selected: true },
        { label: "Testnet", value: "testnet" },
        { label: "Betanet", value: "betanet" },
        { label: "Devnet", value: "devnet" },
      ],
    },
    {
      label: "Node type",
      type: "select",
      symbol: "nodeType",
      options: [
        { label: "Default", value: "default", selected: true },
        { label: "Participant", value: "participant" },
        { label: "Relay", value: "relay" },
        { label: "Indexer", value: "indexer" },
      ],
    },
  ];

  const participantFields: IFormField[] = [
    {
      label: "Account Mnemonics",
      symbol: "mnemonics",
      placeholder: "Algorand Account Mnemonics",
      type: "text",
      validator: validateMnemonics,
      invalid: false,
    },
    {
      label: "First Round",
      symbol: "firstRound",
      placeholder: "First Validation Block",
      type: "text",
      invalid: false,
    },
    {
      label: "Last Round",
      symbol: "lastRound",
      placeholder: "Last Validation Block",
      type: "text",
      invalid: false,
    },
  ];

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || isInvalid(fields); // prettier-ignore
  let message: string;
  let modalData: Object;

  async function deployAlgorandHandler() {
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

    deployAlgorand(data, profile)
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

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
  }}
/>

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={deployAlgorandHandler}>
    <h4 class="is-size-4 mb-4">Deploy a Algorand Instance</h4>
    <p>
      Algorand (ALGO) is a blockchain platform and cryptocurrency designed to
      function like a major payments processor.
      <a target="_blank" href=""> Quick start documentation</a>
    </p>

    <hr />

    {#if loading || (logs !== null && logs.type === "Algorand")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully Deployed Algorand."
        deployed={true}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to Deploy Algorand."} />
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

        {#if data.nodeType == "participant"}
          {#each participantFields as field (field.symbol)}
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
        {/if}

        <SelectCapacity
          bind:cpu={data.cpu}
          bind:memory={data.memory}
          bind:diskSize={data.diskSize}
          bind:diskField
          bind:cpuField
          bind:memoryField
          {packages}
        />

        <SelectNodeId
          cpu={data.cpu}
          memory={data.memory}
          publicIp={data.publicIp}
          ssd={data.diskSize + rootFs(data.cpu, data.memory)}
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
