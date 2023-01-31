<svelte:options tag="tf-wp" />

<script lang="ts">
  import type { IFormField, IPackage, ITab } from "../../types";
  import type { IProfile } from "../../types/Profile";
  import { Env } from "../../types/vm";
  import Wordpress from "../../types/wp";
  import validateName, { validateRequiredEmail, validateRequiredPassword } from "../../utils/validateName";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Alert from "../../components/Alert.svelte";
  import { noActiveProfile } from "../../utils/message";
  import Tabs from "../../components/Tabs.svelte";

  let loading = false;
  let success = false;
  let failed = false;
  let invalid = true;
  let status: "valid" | "invalid";
  let profile: IProfile;
  let message: string;
  let modalData: object;
  let active = "config";

  const deploymentStore = window.configs?.deploymentStore;
  const currentDeployment = window.configs?.currentDeploymentStore;
  //  $: disabled = ((loading || !data.valid) && !(success || failed)) || invalid || !profile || status !== "valid" || selectCapacity.invalid || isInvalid([...data.smtp.fields,...fields]); // prettier-ignore
  let data = new Wordpress();
  const tabs: ITab[] = [{ label: "Config", value: "config" }];
  let adminFields: IFormField[] = [
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
      label: "Admin Email Address",
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
  $: logs = $currentDeployment;
  async function deployWordpressHandler() {
    console.log("deployWordpressHandler");
  }
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
  <form class="box" on:submit|preventDefault={deployWordpressHandler}>
    <h4 class="is-size-4 mb-4">Deploy a Wordpress Instance</h4>
    <p>
      WordPress is the simplest, most popular way to create your own website or blog. In fact, WordPress powers over
      43.3% of all the websites on the Internet.
      <a target="_blank" href="#"> Quick start documentation</a>
    </p>
    <hr />

    {#if loading || (logs !== null && logs.type === "Discourse")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert type="success" message="Successfully Deployed Discourse." deployed={true} />
    {:else if failed}
      <Alert type="danger" {message} />
    {:else}
      <Tabs bind:active {tabs} />
    {/if}
    <!-- <section style={display(active, "config")}>
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
      /> -->
  </form>
</div>
