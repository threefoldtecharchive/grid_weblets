<svelte:options tag="tf-mattermost" />

<script lang="ts">
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Input from "../../components/Input.svelte";
  import SelectProfile from "../../components/SelectProfile.svelte";
  import { IFormField, IPackage, ITab, SelectCapacityUpdate } from "../../types";
  import type { IProfile } from "../../types/Profile";

  import Modal from "../../components/DeploymentModal.svelte";
  import Mattermost from "../../types/mattermost";
  import Alert from "../../components/Alert.svelte";
  import { noActiveProfile } from "../../utils/message";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import deployMattermost from "../../utils/deployMattermost";
  import validateName, {
    isInvalid,
    validateRequiredEmail,
    validateRequiredPortNumber,
    validateRequiredPassword,
  } from "../../utils/validateName";
  import { validateRequiredHostName } from "../../utils/validateDomainName";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import rootFs from "../../utils/rootFs";
  import Tabs from "../../components/Tabs.svelte";
  import type { GatewayNodes } from "../../utils/gatewayHelpers";
  import SelectGatewayNode from "../../components/SelectGatewayNode.svelte";
  import { display } from "../../utils/display";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";

  const currentDeployment = window.configs?.currentDeploymentStore;
  const deploymentStore = window.configs?.deploymentStore;
  const data = new Mattermost();
  // const validator = (x: string) => x.trim().length === 0 ? "Value can't be empty." : null;
  let gateway: GatewayNodes;
  let invalid = true;
  let editable = false;

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
      validator: validateRequiredEmail,
      invalid: true,
    },
    {
      label: "SMTP Password",
      symbol: "smtpPassword",
      type: "password",
      validator: validateRequiredPassword,
      placeholder: "SMTP Password",
      invalid: false,
    },
    {
      label: "SMTP Server",
      symbol: "server",
      type: "text",
      placeholder: "SMTP server",
      validator: validateRequiredHostName,
      invalid: false,
    },
    {
      label: "SMTP Port",
      symbol: "port",
      type: "text",
      placeholder: "SMTP Port",
      validator: validateRequiredPortNumber,
      invalid: false,
    },
  ];

  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024 * 2, diskSize: 10 },
    { name: "Standard", cpu: 2, memory: 1024 * 4, diskSize: 50 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 100 },
  ];
  let selectCapacity = new SelectCapacityUpdate();

  let profile: IProfile;
  let loading = false;
  let failed = false;
  let success = false;
  let message: string;

  let modalData: object;

  $: disabled =
    (editable && isInvalid([...smtpFields])) ||
    invalid ||
    data.invalid ||
    data.status !== "valid" ||
    selectCapacity.invalid ||
    isInvalid([...baseFields]);

  function onDeployMattermost() {
    loading = true;
    deployMattermost(profile, data, gateway)
      .then(data => {
        modalData = data;
        deploymentStore.set(0);
        success = true;
      })
      .catch((err: string) => {
        failed = true;
        message = normalizeDeploymentErrorMessage(err, "Mattermost");
      })
      .finally(() => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "Wordpress");
  $: showNoProfile = !showLogs && !profile;
  $: showSuccess = !showLogs && !showNoProfile && success;
  $: showFailed = !showLogs && !showNoProfile && failed;
  $: showContent = !showLogs && !showNoProfile && !showSuccess && !showFailed;
</script>

<SelectProfile on:profile={({ detail }) => (profile = detail)} />

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={onDeployMattermost}>
    <h4 class="is-size-4">Deploy a Mattermost Instance</h4>
    <p>
      Mattermost A single point of collaboration. Designed specifically for digital operations.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_mattermost.html"> Quick start documentation</a>
    </p>
    <hr />

    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed MatterMost." deployed={true} />
    </div>

    <div style:display={showFailed ? "block" : "none"}>
      <Alert type="danger" {message} />
    </div>

    <div style:display={showContent ? "block" : "none"}>
      <Tabs {tabs} bind:active />

      <section style={display(active, "base")}>
        {#each baseFields as field (field.symbol)}
          <Input bind:data={data[field.symbol]} bind:invalid={field.invalid} {field} />
        {/each}

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
          bind:data={data.nodeId}
          bind:status={data.status}
          bind:nodeSelection={data.selection.type}
          {profile}
          cpu={data.cpu}
          ssd={data.disks.reduce((total, disk) => total + disk.size, rootFs(data.cpu, data.memory))}
          memory={data.memory}
          publicIp={data.publicIp}
          nodes={data.selection.nodes}
          filters={data.selection.filters}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
        />
      </section>
      <section style={display(active, "smtp")}>
        <div class="notification is-warning is-light">
          <p>Mattermost does not require an SMTP server. If you want to use an SMTP server, you can configure it.</p>
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
        {#each smtpFields as field (field.symbol)}
          <Input
            bind:data={data[field.symbol]}
            bind:invalid={field.invalid}
            field={{ ...field, disabled: !editable }}
          />
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
