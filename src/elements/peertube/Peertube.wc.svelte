<svelte:options tag="tf-peertube" />

<script lang="ts">
  // Types
  import type { IFormField, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";

  // Modules
  import VM, { Env } from "../../types/vm";
  import deployPeertube from "../../utils/deployPeertube";
  import { gateway, peertubeYggIp } from "../../utils/deployPeertube";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import AlertDetailed from "../../components/AlertDetailed.svelte";

  // Values
  const tabs: ITab[] = [{ label: "Base", value: "base" }];
  const nameField: IFormField = { label: "Name", placeholder: "Virtual Machine Name", symbol: "name", type: "text" }; // prettier-ignore
  const { events } = window.configs?.grid3_client ?? {};
  const deploymentStore = window.configs?.deploymentStore;

  let data = new VM();
  let active: string = "base";
  let loading = false;
  let success = false;
  let failed = false;

  let profile: IProfile;
  let message: string;
  let modalData: Object;

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || !data.name.match(/^[a-z][a-z0-9]*$/i) ; // prettier-ignore

  // doDeploy
  function onDeployVM() {
    loading = true;
    success = false;
    failed = false;
    message = undefined;

    function onLogInfo(msg: string) {
      if (typeof msg === "string") {
        message = msg;
      }
    }

    events.addListener("logs", onLogInfo);

    deployPeertube(data, profile)
      .then(() => {
        deploymentStore.set(0);
        success = true;
        console.log(gateway);
        console.log(peertubeYggIp);
      })
      .catch((err: Error) => {
        failed = true;
        message = typeof err === "string" ? err : err.message;
      })
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
  }

  function validateNameHandler(e: Event) {
    const inp = e.target as HTMLInputElement;
    nameField.error = inp.value.match(/^[a-z][a-z0-9]*$/i)
      ? null
      : "Only alphanumeric names are allowed";
  }
</script>

<div style="padding: 15px;">
  <!-- Container -->
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Peertube Instance</h4>
    <hr />

    <!-- Status -->
    {#if loading}
      <Alert type="info" message={message || "Loading..."} />
    {:else if success}
      <AlertDetailed
        type="success"
        message="Successfully Deployed A Peertube Instance"
        planetaryIP={peertubeYggIp}
        {gateway}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to deploy VM."} />
    {:else}
      <SelectProfile
        on:profile={({ detail }) => {
          profile = detail;
          if (detail) {
            data.envs[0] = new Env(undefined, "SSH_KEY", detail.sshKey);
          }
        }}
      />

      <!-- Tab Container -->
      <Tabs bind:active {tabs} />

      {#if active === "base"}
        <Input
          bind:data={data.name}
          field={nameField}
          on:input={validateNameHandler}
        />
        <SelectNodeId
          publicIp={false}
          cpu={data.cpu}
          memory={data.memory}
          ssd={data.disks.reduce(
            (total, disk) => total + disk.size,
            data.rootFsSize
          )}
          bind:data={data.nodeId}
          {profile}
        />
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
  // @import "../../assets/global.scss";
</style>
