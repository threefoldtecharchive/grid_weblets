<svelte:options tag="tf-presearch" />

<script lang="ts">
  import Presearch from "../../types/presearch";
  import type { IProfile } from "../../types/Profile";
  import type { IFormField, IPackage, ITab } from "../../types";
  import deployPresearch from "../../utils/deployPresearch";
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
  import validateName, { isInvalid, validatePreCode} from "../../utils/validateName"; // prettier-ignore
  import { noActiveProfile } from "../../utils/message";

  let data = new Presearch();
  let profile: IProfile;

  let loading = false;
  let success = false;
  let failed = false;

  let status: "valid" | "invalid";

  const deploymentStore = window.configs?.deploymentStore;
  const currentDeployment = window.configs?.currentDeploymentStore;

  // Tabs
  const tabs: ITab[] = [
    { label: "Base", value: "base" },
    { label: "Restore", value: "restore" },
  ];
  let active = "base";

  // Fields
  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Presearch Instance Name", type: "text", validator: validateName, invalid: false },
    { label: "Presearch Registeration Code", symbol: "preCode", placeholder: "Presearch Registeration Code", type: "password", validator: validatePreCode, invalid: false },
    { label: "Planetary Network", symbol: "planetary", placeholder: "Enable planetary network", type: 'checkbox' },
    { label: "Public IP", symbol: "publicIp", placeholder: "Enable Public Ip", type: 'checkbox' },
  ];

  const restoreFields: IFormField[] = [
    {
      label: "Private Presearch Restore Key",
      symbol: "privateRestoreKey",
      placeholder: "Restore Previous Presearch Node",
      type: "textarea",
      invalid: false,
    },
    {
      label: "Public Presearch Restore Key",
      symbol: "publicRestoreKey",
      placeholder: "Restore Previous Presearch Node",
      type: "textarea",
      invalid: false,
    },
  ];

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || isInvalid(fields); // prettier-ignore

  let message: string;
  let modalData: Object;

  async function deployPresearchHandler() {
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

    deployPresearch(data, profile)
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
  <form class="box" on:submit|preventDefault={deployPresearchHandler}>
    <h4 class="is-size-4 mb-4">Deploy a Presearch Instance</h4>
    <p>
      Presearch is a community-powered, decentralized search engine that provides better results while protecting your privacy and rewarding you when you search. This weblet deploys a Presearch node. Presearch Nodes are used to process user search requests, and node operators earn Presearch PRE tokens for joining and supporting the network.
      <a
        target="_blank"
        href="https://library.threefold.me/info/manual/#/manual__weblets_presearch"
      >
        Quick start documentation</a
      >
    </p>

    <hr />

    {#if loading || (logs !== null && logs.type === "Presearch")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully Deployed Presearch."
        deployed={true}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to Deploy Presearch."} />
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
          exclusiveFor="presearch"
        />
      {:else if active === "restore"}
        <div class="notification is-warning is-light">
          <p>
            Only configure these Presearch Restore Keys fields if you want to
            restore previous node. see backup steps <a
              href="https://docs.presearch.org/nodes/backing-up-and-migrating-nodes"
              target="_blank">here</a
            >.
          </p>
        </div>
        {#each restoreFields as field (field.symbol)}
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
