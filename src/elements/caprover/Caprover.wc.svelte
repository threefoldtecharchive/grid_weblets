<svelte:options tag="tf-caprover" />

<script lang="ts">
  import type { IFormField, IPackage, ITab } from "../../types";
  import { CapWorker, default as Caprover } from "../../types/caprover";
  import deployCaprover, { deployWorker } from "../../utils/deployCaprover";
  import type { IProfile } from "../../types/Profile";

  // Components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, {
    isInvalid,
    validatePassword
  } from "../../utils/validateName";
  import validateDomainName from "../../utils/validateDomainName";
  import { noActiveProfile } from "../../utils/message";
  import rootFs from "../../utils/rootFs";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
    import AddBtn from "../../components/AddBtn.svelte";
    import DeleteBtn from "../../components/DeleteBtn.svelte";

  const data = new Caprover();
  let loading = false;
  let success = false;
  let failed = false;
  const deploymentStore = window.configs?.deploymentStore;
  let profile: IProfile;
  let status: "valid" | "invalid";
  const currentDeployment = window.configs?.currentDeploymentStore;

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Config", value: "config" },
    { label: "Leader", value: "leader" },
    { label: "Workers", value: "workers" },
  ];
  let active = "config";

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Domain", symbol: "domain", placeholder: "Domain configured in your name provider.", type: "text", validator: validateDomainName, invalid: false },
    { label: "Password", symbol: "password", placeholder: "Caprover New Password", type: "password", validator: validatePassword, invalid: false },
  ];

  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024, diskSize: 50 },
    { name: "Standard", cpu: 2, memory: 1024 * 2, diskSize: 100 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 250 },
  ];

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "CapRover instance name", type: "text", validator: validateName, invalid: false},
  ];

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || isInvalid([...fields, ...baseFields]); // prettier-ignore
  let message: string;
  let modalData: Object;
  async function deployCaproverHandler() {
    loading = true;

    if (!hasEnoughBalance()) {
      failed = true;
      loading = false;
      message =
        "No enough balance to execute! Transaction requires 2 TFT at least in your wallet.";
      return;
    }

    success = false;
    failed = false;
    message = undefined;

    deployCaprover(data, profile)
      .then(async (vm) => {
        //modalData = vm;
        deploymentStore.set(0);

        console.log(new Date().toLocaleString());

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(240*1000);

        console.log(new Date().toLocaleString());

        for (const worker of data.workers) {
          deployWorker(data, worker, profile)
          .then((data) => {
            console.log("rawda res", data)
            deploymentStore.set(0);
            success = true;
          })
          .catch((err: string) => {
            failed = true;
            message = err;
          });
        }
        modalData = vm;
        //success = true;
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
    if (detail) {
      data.publicKey = detail.sshKey;
    }
  }}
/>

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={deployCaproverHandler}>
    <h4 class="is-size-4 mb-4">CapRover Deployer</h4>
    <p>
      CapRover is an extremely easy to use app/database deployment & web server manager for your NodeJS, Python, PHP, ASP.NET, Ruby, MySQL, MongoDB, Postgres, WordPress (and etc…) applications!
      <a
        target="_blank"
        href="https://library.threefold.me/info/manual/#/manual__weblets_caprover"
      >
        Quick start documentation</a
      >
    </p>
    <hr />

    {#if loading || (logs !== null && logs.type === "CapRover")}
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    {:else if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if success}
      <Alert
        type="success"
        message="Successfully Deployed Caprover."
        deployed={true}
      />
    {:else if failed}
      <Alert type="danger" message={message || "Failed to Deploy Caprover."} />
    {:else}
      <Tabs bind:active selectedTab={"config"} selectedID={0} {tabs} />

      {#if active === "config"}
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
          {#if field.symbol === "domain"}
            <div class="notification is-warning is-light">
              <p>
                You will need to point a wildcard DNS entry for the domain you
                entered above to this CapRover instance IP Address after
                deployment,<br />
                otherwise, you won't be able to access the CapRover dashboard using
                this domain.
              </p>
              <br />
              <strong>
                If you don't know what Captain root domain is, make sure to
                visit <a
                  target="_blank"
                  href="https://library.threefold.me/info/manual/#/manual__weblets_caprover"
                >
                  the Quick start documentation
                </a>.
              </strong>
            </div>
          {/if}
        {/each}
      {:else if active === "leader"}
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
          bind:diskSize={data.diskSize}
          {packages}
        />

        <SelectNodeId
          cpu={data.cpu}
          memory={data.memory}
          publicIp={true}
          ssd={data.diskSize + rootFs(data.cpu, data.memory)}
          bind:data={data.nodeId}
          bind:nodeSelection={data.selection.type}
          bind:status
          filters={data.selection.filters}
          {profile}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
          nodes={data.selection.nodes}
        />
      {:else if active === "workers"}
        <AddBtn
          on:click={() => {const worker = new CapWorker(); worker.publicKey = data.publicKey; data.workers = [...data.workers, worker]; }}
        />
        <div class="nodes-container">
          {#each data.workers as worker, index (worker.id)}
            <div class="box">
              <DeleteBtn
                name={worker.name}
                on:click={() =>
                  (data.workers = data.workers.filter((_, i) => index !== i))}
              />
              {#each baseFields as field (field.symbol)}
                <Input
                  bind:data={worker[field.symbol]}
                  bind:invalid={field.invalid}
                  {field}
                />
              {/each}

              <SelectCapacity
                bind:cpu={worker.cpu}
                bind:memory={worker.memory}
                bind:diskSize={worker.diskSize}
                {packages}
              />

              <SelectNodeId
                cpu={worker.cpu}
                memory={worker.memory}
                publicIp={true}
                ssd={worker.diskSize + rootFs(worker.cpu, worker.memory)}
                bind:data={worker.nodeId}
                bind:nodeSelection={worker.selection.type}
                bind:status
                filters={worker.selection.filters}
                {profile}
                on:fetch={({ detail }) => (worker.selection.nodes = detail)}
                nodes={worker.selection.nodes}
              />
            </div>
          {/each}
        </div>
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
  @import "../../assets/global.scss";
</style>
