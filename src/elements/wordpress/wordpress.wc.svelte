<svelte:options tag="tf-wordpress" />

<script lang="ts">
  import Wordpress from "../../types/wordpress";
  import type { IProfile } from "../../types/Profile";
  import { IFormField, IPackage, ITab, SelectCapacityUpdate } from "../../types";
  import deployWordpress from "../../utils/deployWordpress";
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
  import validateName, { isInvalid, validateRequiredEmail, validateRequiredPassword } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";
  import SelectGatewayNode from "../../components/SelectGatewayNode.svelte";
  import type { GatewayNodes } from "../../utils/gatewayHelpers";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";

  import { display } from "../../utils/display";
  let loading = false;
  let success = false;
  let failed = false;
  let invalid = true;
  let status: "valid" | "invalid";
  let profile: IProfile;
  let gateway: GatewayNodes;
  let message: string;
  let modalData: object;
  let active = "config";

  const deploymentStore = window.configs?.deploymentStore;
  const currentDeployment = window.configs?.currentDeploymentStore;
  $: disabled = ((loading || !data.valid) && !(success || failed)) || invalid || !profile || status !== "valid" || selectCapacity.invalid || isInvalid([...fields]); // prettier-ignore
  let data = new Wordpress();
  data.disks = [new Disk()];
  const tabs: ITab[] = [{ label: "Config", value: "config" }];
  let fields: IFormField[] = [
    {
      label: "Name",
      symbol: "name",
      placeholder: "Wordpress Instance Name",
      type: "text",
      validator: validateName,
      invalid: false,
    },
    {
      label: "Username",
      symbol: "adminUsername",
      placeholder: "Admin Username, will be used in all authentications on the machine",
      type: "text",
      validator: validateName,
      invalid: false,
    },
    {
      label: "Password",
      symbol: "adminPassword",
      placeholder: "Admin Password, will be used in all authentications on the machine",
      type: "password",
      validator: validateRequiredPassword,
      invalid: false,
    },
    {
      label: "Email",
      symbol: "adminEmail",
      placeholder: "support@example.com",
      type: "text",
      validator: validateRequiredEmail,
      invalid: true,
    },
  ];
  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024 * 2, diskSize: 10 },
    { name: "Standard", cpu: 2, memory: 1024 * 2, diskSize: 50 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 100 },
  ];
  let selectCapacity = new SelectCapacityUpdate();
  $: logs = $currentDeployment;
  async function deployWordpressHandler() {
    loading = true;

    console.log(data);

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message = "No enough balance to execute! Transaction requires 2 TFT at least in your wallet.";
      return;
    }

    success = false;
    failed = false;
    message = undefined;
    deployWordpress(data, profile, gateway)
      .then((data: any) => {
        modalData = data.deploymentInfo;
        deploymentStore.set();
        success = true;
      })
      .catch((err: string) => {
        failed = true;
        console.log(err);
        message = normalizeDeploymentErrorMessage(err, "Wordpress");
      })
      .finally(() => {
        loading = false;
      });
  }
</script>

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
  }}
/>
<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={deployWordpressHandler}>
    <h4 class="is-size-4 mb-4">Deploy a Wordpress Instance</h4>
    <p>
      WordPress is the simplest, most popular way to create your own website or blog. In fact, WordPress powers over
      43.3% of all the websites on the Internet.
      <!-- TODO: add the docs link -->
      <a target="_blank" href="#"> Quick start documentation</a>
    </p>
    <hr />

    {#if loading || (logs !== null && logs.type === "Wordpress")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert type="success" message="Successfully Deployed Wordpress." deployed={true} />
    {:else if failed}
      <Alert type="danger" {message} />
    {:else}
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
            data.disks[0].size = diskSize;
          }
        }}
      />
      <SelectGatewayNode bind:gateway bind:invalid />
      <SelectNodeId
        cpu={data.cpu}
        memory={data.memory}
        publicIp={false}
        ssd={data.disks.reduce((total, disk) => total + disk.size, 0)}
        bind:data={data.nodeId}
        bind:nodeSelection={data.selection.type}
        bind:status
        filters={data.selection.filters}
        {profile}
        on:fetch={({ detail }) => (data.selection.nodes = detail)}
        nodes={data.selection.nodes}
      />
    {/if}
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
