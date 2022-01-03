<svelte:options tag="tf-taiga" />

<script lang="ts">
  import VM, { Env } from "../../types/vm";
  import type { IFormField, ITab } from "../../types";
  import deployVM from "../../utils/deployVM";
  import type { IProfile } from "../../types/Profile";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import DeleteBtn from "../../components/DeleteBtn.svelte";
  import AddBtn from "../../components/AddBtn.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, {
    isInvalid,

  } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";

  let data = new VM();

  const tabs: ITab[] = [{ label: "Base", value: "base" }]

  let profile: IProfile;
  let active: string = "base";
  let loading = false;
  let success = false;
  let failed = false;

  let baseFields: IFormField[] = [
    { label: "Public IP", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "", type: 'checkbox' },
  ];

  const nameField: IFormField = { label: "Instance Name", placeholder: "Taiga's instance name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore

  let message: string;
  let modalData: Object;
  let status: "valid" | "invalid";

  const deploymentStore = window.configs?.deploymentStore;

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || nameField.invalid || isInvalid(baseFields); // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;

  async function onDeployVM() {
    loading = true;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message =
        "No enough balance to execute transaction requires 2 TFT at least in your wallet.";
      return;
    }

    success = false;
    failed = false;
    message = undefined;

    deployVM(data, profile)
      .then((data) => {
        deploymentStore.set(0);
        success = true;
        modalData = data;
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
    <h4 class="is-size-4">Deploy a Taiga Instance</h4>
    <hr />

    {#if loading || (logs !== null && logs.type === "VM")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully deployed Taiga."
        deployed={true}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy Taiga."} />
    {:else}
      <Tabs bind:active {tabs} />

      {#if active === "base"}
        <Input
          bind:data={data.name}
          bind:invalid={nameField.invalid}
          field={nameField}
        />

        {#each baseFields as field (field.symbol)}
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
          publicIp={data.publicIp}
          cpu={data.cpu}
          memory={data.memory}
          ssd={data.disks.reduce(
            (total, disk) => total + disk.size,
            data.rootFsSize
          )}
          bind:nodeSelection={data.selection.type}
          bind:data={data.nodeId}
          filters={data.selection.filters}
          bind:status
          {profile}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
          nodes={data.selection.nodes}
        />
      {:else if active === "env"}
        <AddBtn on:click={() => (data.envs = [...data.envs, new Env()])} />
        <div class="nodes-container">
          {#each data.envs as env, index (env.id)}
            <div class="box">
              <DeleteBtn
                name={env.key}
                on:click={() =>
                  (data.envs = data.envs.filter((_, i) => index !== i))}
              />
            </div>
          {/each}
        </div>
        
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
  @import "../../assets/global.scss";
</style>
