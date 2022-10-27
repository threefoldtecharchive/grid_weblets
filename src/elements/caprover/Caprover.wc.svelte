<svelte:options tag="tf-caprover" />

<script lang="ts">
  import {
    IFormField,
    IPackage,
    ITab,
    SelectCapacityUpdate,
  } from "../../types";
  import { CapWorker, default as Caprover } from "../../types/caprover";
  import deployCaprover from "../../utils/deployCaprover";

  // Components
  import Input from "../../components/Input.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import DeployBtn from "../../components/DeployBtn.svelte";
  import Alert from "../../components/Alert.svelte";
  import SelectNodeId from "../../components/SelectNodeId.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import hasEnoughBalance from "../../utils/hasEnoughBalance";
  import validateName, {
    isInvalid,
    validatePassword,
  } from "../../utils/validateName";
  import validateDomainName from "../../utils/validateDomainName";
  import { noActiveProfile } from "../../utils/message";
  import rootFs from "../../utils/rootFs";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import AddBtn from "../../components/AddBtn.svelte";
  import DeleteBtn from "../../components/DeleteBtn.svelte";
  import getGrid from "../../utils/getGrid";

  const activeProfile = window.configs?.activeProfileStore;

  let data = new Caprover();
  let loading = false;
  let success = false;
  let failed = false;
  const deploymentStore = window.configs?.deploymentStore;
  $: profile = $activeProfile;
  let status: "valid" | "invalid";
  const currentDeployment = window.configs?.currentDeploymentStore;
  // let grid;

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
  let selectCapacity = new SelectCapacityUpdate();

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "CapRover instance name", type: "text", validator: validateName, invalid: false},
  ];

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || selectCapacity.invalid || data.workers.some(({ selectCapacity }) => selectCapacity.invalid) || isInvalid([...fields, ...baseFields]); // prettier-ignore
  let message: string;
  let modalData: Object;
  let workerData: boolean = false;
  let workerIp = "";
  let domain = "";
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
        const grid = await getGrid(profile, _ => _);
        grid.projectName = "caprover";
        grid._connect();

        let vms = await grid.machines.getObj(data.name);
        success = true;
        modalData = vms;
        deploymentStore.set(0);

        vms.forEach((machine) => {
          let firstWorker = true;
          if (machine.env["SWM_NODE_MODE"] == "worker") {
            if (firstWorker) {
              workerIp += machine.publicIP["ip"].split("/")[0] + ", ";
              firstWorker = false;
            } else workerIp += machine.publicIP["ip"].split("/")[0] + ", ";
          }
        });
        domain = vms.filter(
          (machine) => machine.env["SWM_NODE_MODE"] == "leader"
        )[0].env["CAPROVER_ROOT_DOMAIN"];

        if (data.workers.length > 0) workerData = true;
      })
      .catch((err: string) => {
        failed = true;
        message = err;
      })
      .finally(async () => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;
</script>

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={deployCaproverHandler}>
    <h4 class="is-size-4 mb-4">CapRover Deployer</h4>
    <p>
      CapRover is an extremely easy to use app/database deployment & web server
      manager for your NodeJS, Python, PHP, ASP.NET, Ruby, MySQL, MongoDB,
      Postgres, WordPress (and etc…) applications!
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
      <Tabs bind:active {tabs} />

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

        <SelectNodeId
          cpu={data.cpu}
          memory={data.memory}
          publicIp={true}
          ssd={data.diskSize + rootFs(data.cpu, data.memory)}
          bind:data={data.nodeId}
          bind:nodeSelection={data.selection.type}
          bind:status
          filters={data.selection.filters}
          on:fetch={({ detail }) => (data.selection.nodes = detail)}
          nodes={data.selection.nodes}
        />
      {:else if active === "workers"}
        <AddBtn
          on:click={() => (data.workers = [...data.workers, new CapWorker()])}
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
                {#if field.invalid !== undefined}
                  <Input
                    bind:data={worker[field.symbol]}
                    bind:invalid={field.invalid}
                    {field}
                  />
                {:else}
                  <Input bind:data={worker[field.symbol]} {field} />
                {/if}
              {/each}

              <SelectCapacity
                {packages}
                selectedPackage={worker.selectCapacity.selectedPackage}
                cpu={worker.cpu}
                memory={worker.memory}
                diskSize={worker.diskSize}
                on:update={({ detail }) => {
                  worker.selectCapacity = detail;
                  if (!detail.invalid) {
                    const { cpu, memory, diskSize } = detail.package;
                    worker.cpu = cpu;
                    worker.memory = memory;
                    worker.diskSize = diskSize;
                  }
                }}
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

<div class={"modal" + (workerData ? " is-active" : "")}>
  <div class="modal-background" />
  <div class="modal-card">
    <section class="modal-card-body">
      <strong style="font-size: larger;">Add your worker</strong>
      <br />
      <br />
      1- Go to {"http://captain." + domain}<br />
      2- Go to the <strong>cluster</strong> tab<br />
      3- Click <strong>Add Self-Hosted Registry</strong> button then
      <strong>Enable Self-Hosted Registry</strong><br />
      4- Insert worker node public IP <strong>{workerIp}</strong> and add your
      private SSH Key<br />
      5- Click <strong>Join cluster</strong> button<br />
      <br />
      <strong>
        <a
          target="_blank"
          href="https://library.threefold.me/info/manual/#/manual__weblets_caprover_worker"
        >
          Click here for the documentation
        </a>
      </strong>
      <div style="float: right; margin-top: 50px;">
        <button
          class="button is-danger"
          on:click|stopPropagation={() => (workerData = !workerData)}
          >Close</button
        >
      </div>
    </section>
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import "../../assets/global.scss";
</style>
