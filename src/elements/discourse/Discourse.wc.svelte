<svelte:options tag="tf-discourse" />

<script lang="ts">
  import { IFormField, IPackage, ITab, SelectCapacityUpdate } from "../../types";
  import { default as Discourse } from "../../types/discourse";
  import deployDiscourse from "../../utils/deployDiscourse";
  import type { IProfile } from "../../types/Profile";
  import rootFs from "../../utils/rootFs";
  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, { isInvalid, validateEmail } from "../../utils/validateName";
  import { noActiveProfile } from "../../utils/message";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import type { GatewayNodes } from "../../utils/gatewayHelpers";
  import SelectGatewayNode from "../../components/SelectGatewayNode.svelte";
  import { display } from "../../utils/display";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";

  const data = new Discourse();

  let loading = false;
  let success = false;
  let failed = false;
  let invalid = true;
  let gateway: GatewayNodes;

  let status: "valid" | "invalid";
  let profile: IProfile;

  const deploymentStore = window.configs?.deploymentStore;
  const currentDeployment = window.configs?.currentDeploymentStore;

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Mail Server", value: "mail" },
  ];
  let active = "config";

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Discourse Instance Name", type: "text", validator: validateName, invalid: false },
    { label: "Email", symbol: "developerEmail", placeholder: "Admin Email", type: "text", validator: validateEmail, invalid: false },
  ];

  // define this solution packages
  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024 * 2, diskSize: 10 },
    { name: "Standard", cpu: 2, memory: 1024 * 2, diskSize: 50 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 100 },
  ];
  let selectCapacity = new SelectCapacityUpdate();

  $: disabled = ((loading || !data.valid) && !(success || failed)) || invalid || !profile || status !== "valid" || selectCapacity.invalid || isInvalid([...data.smtp.fields,...fields]); // prettier-ignore

  let message: string;
  let modalData: object;

  async function deployDiscourseHandler() {
    loading = true;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message = "No enough balance to execute! Transaction requires 2 TFT at least in your wallet.";
      return;
    }

    success = false;
    failed = false;
    message = undefined;

    deployDiscourse(data, profile, gateway)
      .then((data: any) => {
        modalData = data.deploymentInfo;
        deploymentStore.set(0);
        success = true;
      })
      .catch((err: string) => {
        failed = true;
        message = normalizeDeploymentErrorMessage(err, "Discourse");
      })
      .finally(() => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "Discourse");
  $: showNoProfile = !showLogs && !profile;
  $: showSuccess = !showLogs && !showNoProfile && success;
  $: showFailed = !showLogs && !showNoProfile && failed;
  $: showContent = !showLogs && !showNoProfile && !showSuccess && !showFailed;
</script>

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
  }}
/>

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={deployDiscourseHandler}>
    <h4 class="is-size-4 mb-4">Deploy a Discourse Instance</h4>
    <p>
      Discourse is the 100% open source discussion platform built for the next decade of the Internet. Use it as a
      mailing list, discussion forum, long-form chat room, and more!
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_discourse.html"> Quick start documentation</a>
    </p>

    <hr />

    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed Discourse." deployed={true} />
    </div>

    <div style:display={showFailed ? "block" : "none"}>
      <Alert type="danger" {message} />
    </div>

    <div style:display={showContent ? "block" : "none"}>
      <Tabs bind:active {tabs} />

      <section style={display(active, "config")}>
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
              data.diskSize = diskSize;
            }
          }}
        />
        <SelectGatewayNode bind:gateway bind:invalid />
        <SelectNodeId
          cpu={data.cpu}
          memory={data.memory}
          publicIp={false}
          ssd={data.diskSize + rootFs(data.cpu, data.memory)}
          bind:data={data.nodeId}
          bind:nodeSelection={data.selection.type}
          bind:status
          filters={data.selection.filters}
          {profile}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
          nodes={data.selection.nodes}
        />
      </section>

      <section style={display(active, "mail")}>
        <div class="notification is-warning is-light">
          <p>Discourse needs SMTP service so please configure these settings properly.</p>
        </div>
        {#each data.smtp.fields as field (field.symbol)}
          {#if field.invalid !== undefined}
            <Input bind:data={data.smtp[field.symbol]} bind:invalid={field.invalid} {field} />
          {:else}
            <Input bind:data={data.smtp[field.symbol]} {field} />
          {/if}
        {/each}
      </section>
    </div>

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
</style>
