<svelte:options tag="tf-mattermost" />

<script lang="ts">
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Input from "../../components/Input.svelte";
  import SelectProfile from "../../components/SelectProfile.svelte";
  import type { IFormField, IPackage, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";

  import Modal from "../../components/DeploymentModal.svelte";
  import Mattermost from "../../types/mattermost";
  import Alert from "../../components/Alert.svelte";
  import { noActiveProfile } from "../../utils/message";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import deployMattermost from "../../utils/deployMattermost";
  import validateName, {
    isInvalid,
    validatePortNumber,
    validateOptionalEmail,
    validateOptionalPassword,
  } from "../../utils/validateName";
  import validateDomainName from "../../utils/validateDomainName";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import rootFs from "../../utils/rootFs";
  import Tabs from "../../components/Tabs.svelte";
  import AddBtn from "../../components/AddBtn.svelte";

  const currentDeployment = window.configs?.currentDeploymentStore;
  const deploymentStore = window.configs?.deploymentStore;
  const data = new Mattermost();
  const validator = (x: string) => x.trim().length === 0 ? "Value can't be empty." : null; // prettier-ignore

  const tabs: ITab[] = [
    { label: "Base", value: "base" },
    { label: "SMTP Server", value: "smtp" },
  ];
  let active = "base";

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: "name", type: "text", placeholder: "Mattermost Instance Name", validator: validateName, invalid: false },
  ];

  const smtpFields: IFormField[] = [
    {
      label: "SMTP Username",
      symbol: "username",
      type: "text",
      placeholder: "SMTP Username",
      validator: validateOptionalEmail,
      invalid: false,
    },
    {
      label: "SMTP Password",
      symbol: "smtpPassword",
      type: "password",
      validator: validateOptionalPassword,
      placeholder: "SMTP Password",
      invalid: false,
    },
    {
      label: "SMTP Server",
      symbol: "server",
      type: "text",
      placeholder: "SMTP server",
      validator: validateDomainName,
      invalid: false,
    },
    {
      label: "SMTP Port",
      symbol: "port",
      type: "text",
      placeholder: "SMTP Port",
      validator: validatePortNumber,
      invalid: false,
    },
  ];

  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024 * 2, diskSize: 10 },
    { name: "Standard", cpu: 2, memory: 1024 * 4, diskSize: 50 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 100 },
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
    isInvalid([...baseFields, diskField, memoryField, cpuField, ...smtpFields]);

  function onDeployMattermost() {
    loading = true;
    deployMattermost(profile, data)
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

<SelectProfile on:profile={({ detail }) => (profile = detail)} />

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={onDeployMattermost}>
    <h4 class="is-size-4">Deploy a Mattermost Instance</h4>
    <p>
      Mattermost A single point of collaboration. Designed specifically for
      digital operations.
      <a
        target="_blank"
        href="https://library.threefold.me/info/manual/#/manual__weblets_mattermost"
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
        message="Successfully deployed Mattermost."
        deployed={true}
      />
    {:else if failed}
      <Alert
        type="danger"
        message={message || "Failed to deploy Mattermost."}
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
      {:else if active === "smtp"}
        <div class="notification is-warning is-light">
          <p>
            Mattermost does not require an SMTP server. If you want to use an
            SMTP server, you can configure it.
          </p>
        </div>
        {#each smtpFields as field (field.symbol)}
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
