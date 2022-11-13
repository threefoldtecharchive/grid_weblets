<svelte:options tag="tf-polygon" />

<script lang="ts">
  import Polygon from "../../types/polygon";
  import type { IProfile } from "../../types/Profile";
  import type { IFormField, ITab } from "../../types";
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
  import validateName, { isInvalid} from "../../utils/validateName"; // prettier-ignore
  import { noActiveProfile } from "../../utils/message";
  import { getResources } from "../../utils/getPolyResources";
 import deployPolygon from "../../utils/deployPolygon";

  let data = new Polygon();
  let profile: IProfile;

  let loading = false;
  let success = false;
  let failed = false;

  let status: "valid" | "invalid";

  const deploymentStore = window.configs?.deploymentStore;
  const currentDeployment = window.configs?.currentDeploymentStore;
  // Tabs
  const tabs: ITab[] = [{ label: "Base", value: "base" }];
  let active = "base";

  // Fields
  const fields: IFormField[] = [
    {
      label: "Name",
      symbol: "name",
      placeholder: "Polygon Instance Name",
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
  ];
  const nodeFields: IFormField[] = [
    {
      label: "Set Custom Capacity",
      symbol: "customCapacity",
      placeholder: "",
      type: "checkbox",
    },
    {
      label: "Network",
      type: "select",
      symbol: "nodeNetwork",
      options: [
        { label: "Mainnet", value: "mainnet", selected: true },
        { label: "Testnet", value: "testnet" },
      ],
    },
    {
      label: "Node type",
      type: "select",
      symbol: "nodeType",
      options: [
        { label: "Bor", value: "bor", selected: true },
      ],
    },
  ];

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || isInvalid(fields); // prettier-ignore

  const setResouces = () => {
    console.log("setting resources");
    [data.cpu, data.memory, data.rootSize] = getResources(
      data.nodeNetwork,
      data.nodeType
    );
  };
  setResouces(); // initial setting

  let message: string;
  let modalData: Object;

  async function deployPolygonHandler() {
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

    deployPolygon(data, profile)
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
  <form class="box" on:submit|preventDefault={deployPolygonHandler}>
    <h4 class="is-size-4 mb-4">Deploy a Polygon Instance</h4>
    <p>
      Polygon (MATIC) is an Indian blockchain platform. It aims to create a multi-chain blockchain ecosystem compatible with Ethereum. As with Ethereum, it uses a Proof of Stake consensus model. 
      <a
        target="_blank"
        href=""
      >
        Quick start documentation</a
      >
    </p>

    <hr />

    {#if loading || (logs !== null && logs.type === "Polygon")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully Deployed Polygon."
        deployed={true}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to Deploy Polygon."} />
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

        {#each nodeFields as field (field.symbol)}
          {#if field.invalid !== undefined}
            <Input
              bind:data={data[field.symbol]}
              bind:invalid={field.invalid}
              {field}
            />
          {:else}
            <Input
              bind:data={data[field.symbol]}
              {field}
              on:input={setResouces}
            />
          {/if}
        {/each}



        <SelectNodeId
          cpu={data.cpu}
          memory={data.memory}
          publicIp={data.publicIp}
          ssd={data.rootSize + rootFs(data.cpu, data.memory)}
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
