<svelte:options tag="tf-taiga" />

<script lang="ts">
  import { Disk, Env } from "../../types/vm";
  import { IFormField, IPackage, ITab, SelectCapacityUpdate } from "../../types";
  import deployTaiga from "../../utils/deployTaiga";
  import type { IProfile } from "../../types/Profile";
  import Taiga from "../../types/taiga";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, {
    isInvalid,
    validateEmail,
    validatePassword,
    validateRequiredEmail,
    validateRequiredPortNumber,
    validateRequiredPassword,
  } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";
  import validateDomainName from "../../utils/validateDomainName";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import SelectGatewayNode from "../../components/SelectGatewayNode.svelte";
  import type { GatewayNodes } from "../../utils/gatewayHelpers";
  import { display } from "../../utils/display";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";

  let data = new Taiga();
  let gateway: GatewayNodes;
  let invalid = true;
  let editable: boolean;
  data.disks = [new Disk()];
  let profile: IProfile;
  let active = "base";
  let loading = false;
  let success = false;
  let failed = false;

  const tabs: ITab[] = [
    { label: "Base", value: "base" },
    { label: "Mail Server", value: "mail" },
  ];
  const nameField: IFormField = { label: "Name", placeholder: "Taiga Instance Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore

  let adminFields: IFormField[] = [
    {
      label: "Username",
      symbol: "adminUsername",
      placeholder: "Admin Username",
      type: "text",
      validator: validateName,
      invalid: false,
    },
    {
      label: "Password",
      symbol: "adminPassword",
      placeholder: "Admin Password",
      type: "password",
      validator: validatePassword,
      invalid: false,
    },
    {
      label: "Email",
      symbol: "adminEmail",
      placeholder: "admin@example.com",
      type: "text",
      validator: validateEmail,
      invalid: false,
    },
  ];

  let mailFields: IFormField[] = [
    {
      label: "From Email Address",
      symbol: "smtpFromEmail",
      placeholder: "support@example.com",
      type: "text",
      validator: validateRequiredEmail,
      invalid: true,
    },
    {
      label: "Host Name",
      symbol: "smtpHost",
      placeholder: "smtp.example.com",
      type: "text",
      validator: validateDomainName,
      invalid: true,
    },
    {
      label: "Port",
      symbol: "smtpPort",
      placeholder: "587",
      type: "text",
      validator: validateRequiredPortNumber,
      invalid: true,
    },
    {
      label: "User Name",
      symbol: "smtpHostUser",
      placeholder: "user@example.com",
      type: "text",
      validator: validateRequiredEmail,
      invalid: true,
    },
    {
      label: "Password",
      symbol: "smtpHostPassword",
      placeholder: "password",
      type: "password",
      validator: validateRequiredPassword,
      invalid: true,
    },
    { label: "Use TLS", symbol: "smtpUseTLS", type: "checkbox" },
    { label: "Use SSL", symbol: "smtpUseSSL", type: "checkbox" },
  ];

  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 2, memory: 1024 * 2, diskSize: 100 },
    { name: "Standard", cpu: 2, memory: 1024 * 4, diskSize: 150 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 250 },
  ];
  let selectCapacity = new SelectCapacityUpdate();

  let message: string;
  let modalData: object;
  let status: "valid" | "invalid";

  const deploymentStore = window.configs?.deploymentStore;

  $: disabled = 
  editable && isInvalid([...mailFields]) ||
  ((loading || !data.valid) && !(success || failed)) ||
  invalid || 
  !profile || 
  status !== "valid" || 
  isInvalid([...adminFields, nameField]); // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;

  async function onDeployVM() {
    loading = true;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message = "No enough balance to execute transaction requires 2 TFT at least in your wallet.";
      return;
    }

    success = false;
    failed = false;
    message = undefined;

    deployTaiga(data, profile, gateway)
      .then(data => {
        deploymentStore.set(0);
        success = true;
        modalData = data.deploymentInfo;
      })
      .catch((err: string) => {
        failed = true;
        message = normalizeDeploymentErrorMessage(err, "Taiga");
      })
      .finally(() => {
        loading = false;
      });
  }
  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "Taiga");
  $: showNoProfile = !showLogs && !profile;
  $: showSuccess = !showLogs && !showNoProfile && success;
  $: showFailed = !showLogs && !showNoProfile && failed;
  $: showContent = !showLogs && !showNoProfile && !showSuccess && !showFailed;
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
    <p>
      Taiga is the project management tool for multi-functional agile teams. It has a rich feature set and at the same
      time it is very simple to start with through its intuitive user interface.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_taiga.html"> Quick start documentation</a>
    </p>
    <hr />

    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed Taiga." deployed={true} />
    </div>

    <div style:display={showFailed ? "block" : "none"}>
      <Alert type="danger" {message} />
    </div>

    <div style:display={showContent ? "block" : "none"}>
      <Tabs bind:active {tabs} />

      <section style={display(active, "base")}>
        <Input bind:data={data.name} bind:invalid={nameField.invalid} field={nameField} />
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

        {#each adminFields as field (field.symbol)}
          {#if field.invalid !== undefined}
            <Input bind:data={data[field.symbol]} bind:invalid={field.invalid} {field} />
          {:else}
            <Input bind:data={data[field.symbol]} {field} />
          {/if}
        {/each}
        <SelectGatewayNode bind:gateway bind:invalid />

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
      </section>

      <section style={display(active, "mail")}>
        <div class="notification is-warning is-light">
          <p>configure these settings only If you have an smtp service and you know what you’re doing.</p>
        </div>
        <div class="is-flex is-justify-content-flex-end">
          <div style="display: inline-block;">
            <Input
              bind:data={editable}
              field={{
                label: "",
                symbol: "editable",
                type: "checkbox",
              }}
            />
          </div>
        </div>
        {#each mailFields as field (field.symbol)}
          {#if field.invalid !== undefined}
            <Input
              bind:data={data[field.symbol]}
              bind:invalid={field.invalid}
              field={{ ...field, disabled: !editable }}
            />
          {:else}
            <Input bind:data={data[field.symbol]} field={{ ...field, disabled: !editable }} />
          {/if}
        {/each}
      </section>
    </div>

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
