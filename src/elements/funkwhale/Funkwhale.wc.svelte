<svelte:options tag="tf-funkwhale" />

<script lang="ts">
  import { IFormField, IPackage, ITab, SelectCapacityUpdate } from "../../types";
  import type { IProfile } from "../../types/Profile";

  const deploymentStore = window.configs?.deploymentStore;

  import { Disk, Env } from "../../types/vm";
  import deployFunkwhale from "../../utils/deployFunkwhale";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, { isInvalid, validateEmail, validatePassword } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";
  import rootFs from "../../utils/rootFs";
  import Funkwhale from "../../types/funkwhale";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import SelectGatewayNode from "../../components/SelectGatewayNode.svelte";
  import type { GatewayNodes } from "../../utils/gatewayHelpers";
  import deploymentErrMsg from "../../utils/deploymentErrMsg";

  const data = new Funkwhale();
  data.disks = [new Disk()];

  const tabs: ITab[] = [{ label: "Base", value: "base" }];
  let profile: IProfile;

  let active = "base";
  let modalData: object;
  let loading = false;
  let success = false;
  let failed = false;
  let status: "valid" | "invalid";

  const nameField: IFormField = { label: "Name", placeholder: "Funkwhale Instance Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore
  const userNameField: IFormField = { label: "Username", placeholder: "Username will be used to access your profile", symbol: "username", type: "text", validator: validateName, invalid: false }; // prettier-ignore
  const emailField: IFormField = { label: "Email", placeholder: "This email will be used to login to your instance", symbol: "email", type: "text", validator: validateEmail, invalid: true }; // prettier-ignore

  const passwordField: IFormField = { label: "Password", placeholder: "Password", symbol: "password", type: "password", validator: validatePassword, invalid: false}; // prettier-ignore

  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 2, memory: 1024, diskSize: 50 },
    { name: "Standard", cpu: 2, memory: 1024 * 2, diskSize: 100 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 250 },
  ];
  let selectCapacity = new SelectCapacityUpdate();

  let invalid = true;
  let gateway: GatewayNodes;

  $: disabled = ((loading || !data.valid) && !(success || failed)) || invalid || !profile || status !== "valid" || selectCapacity.invalid || isInvalid([nameField, userNameField, emailField, passwordField]) ; // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;

  let message: string;

  async function onDeployVM() {
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

    deployFunkwhale(data, profile, gateway)
      .then(data => {
        deploymentStore.set(0);
        success = true;
        modalData = data.deploymentInfo;
      })
      .catch((err: string) => {
        failed = true;
        message = deploymentErrMsg(err, "Funkwhale");
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
      data.envs[0] = new Env(undefined, "SSH_KEY", detail.sshKey);
    }
  }}
/>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Funkwhale Instance</h4>
    <p>
      Funkwhale is social platform to enjoy and share music. Funkwhale is a community-driven project that lets you
      listen and share music and audio within a decentralized, open network.
      <a target="_blank" href="https://library.threefold.me/info/manual/#/manual__weblets_funkwhale">
        Quick start documentation</a
      >
    </p>
    <hr />

    {#if loading || (logs !== null && logs.type === "Funkwhale")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert type="success" message="Successfully deployed a Funkwhale instance" deployed={true} />
    {:else if failed}
      <Alert type="danger" {message} />
    {:else}
      <Tabs bind:active {tabs} />

      <Input bind:data={data.name} bind:invalid={nameField.invalid} field={nameField} />
      <Input bind:data={data.adminUsername} bind:invalid={userNameField.invalid} field={userNameField} />
      <Input bind:data={data.adminEmail} bind:invalid={emailField.invalid} field={emailField} />
      <Input bind:data={data.adminPassword} bind:invalid={passwordField.invalid} field={passwordField} />

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
        publicIp={false}
        cpu={data.cpu}
        memory={data.memory}
        ssd={data.disks.reduce((total, disk) => total + disk.size, rootFs(data.cpu, data.memory))}
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
      {failed}
      {success}
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
</style>
