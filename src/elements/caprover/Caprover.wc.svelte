<svelte:options tag="tf-caprover" />

<script lang="ts">
  import { IFormField, IPackage, ITab, SelectCapacityUpdate } from "../../types";
  import { CapWorker, default as Caprover } from "../../types/caprover";
  import deployCaprover from "../../utils/deployCaprover";
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
  import validateName, { isInvalid, validatePassword } from "../../utils/validateName";
  import validateDomainName from "../../utils/validateDomainName";
  import { noActiveProfile } from "../../utils/message";
  import rootFs from "../../utils/rootFs";
  import SelectCapacity from "../../components/SelectCapacity.svelte";
  import AddBtn from "../../components/AddBtn.svelte";
  import DeleteBtn from "../../components/DeleteBtn.svelte";
  import { display } from "../../utils/display";
  import normalizeDeploymentErrorMessage from "../../utils/normalizeDeploymentErrorMessage";

  let data = new Caprover();
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
  let selectCapacity = new SelectCapacityUpdate();

  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "CapRover instance name", type: "text", validator: validateName, invalid: false},
  ];

  $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || selectCapacity.invalid || data.workers.some(({ selectCapacity }) => selectCapacity.invalid) || isInvalid([...fields, ...baseFields]); // prettier-ignore
  let message: string;
  let modalData: object;
  let workerData = false;
  let workerIp = "";
  let domain = "";
  async function deployCaproverHandler() {
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

    deployCaprover(data, profile)
      .then(async grid => {
        let vms = await grid.machines.getObj(data.name);
        success = true;
        modalData = vms;
        deploymentStore.set(0);

        vms.forEach(machine => {
          let firstWorker = true;
          if (machine && machine.env["SWM_NODE_MODE"] == "worker") {
            if (firstWorker) {
              workerIp += machine.publicIP["ip"].split("/")[0] + ", ";
              firstWorker = false;
            } else workerIp += machine.publicIP["ip"].split("/")[0] + ", ";
          }
        });
        domain = vms.filter(machine => machine.env["SWM_NODE_MODE"] == "leader")[0].env["CAPROVER_ROOT_DOMAIN"];

        if (data.workers.length > 0) workerData = true;
      })
      .catch((err: string) => {
        failed = true;
        message = normalizeDeploymentErrorMessage(err, "Caprover");
      })
      .finally(async () => {
        loading = false;
      });
  }

  $: logs = $currentDeployment;

  $: showLogs = loading || (logs !== null && logs.type === "CapRover");
  $: showNoProfile = !showLogs && !profile;
  $: showSuccess = !showLogs && !showNoProfile && success;
  $: showFailed = !showLogs && !showNoProfile && failed;
  $: showContent = !showLogs && !showNoProfile && !showSuccess && !showFailed;
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
      CapRover is an extremely easy to use app/database deployment & web server manager for your NodeJS, Python, PHP,
      ASP.NET, Ruby, MySQL, MongoDB, Postgres, WordPress (and etc…) applications!
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_caprover.html?highlight=caprover#caprover">
        Quick start documentation</a
      >
    </p>
    <hr />

    <div style:display={showLogs ? "block" : "none"}>
      <Alert type="info" message={logs?.message ?? "Loading..."} />
    </div>

    <div style:display={showNoProfile ? "block" : "none"}>
      <Alert type="info" message={noActiveProfile} />
    </div>

    <div style:display={showSuccess ? "block" : "none"}>
      <Alert type="success" message="Successfully Deployed Caprover." deployed={true} />
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
          {#if field.symbol === "domain"}
            <div class="notification is-warning is-light">
              <p>
                You will need to point a wildcard DNS entry for the domain you entered above to this CapRover instance
                IP Address after deployment,<br />
                otherwise, you won't be able to access the CapRover dashboard using this domain.
              </p>
              <br />
              <strong>
                If you don't know what Captain root domain is, make sure to visit <a
                  target="_blank"
                  href="https://manual.grid.tf/weblets/weblets_caprover.html?highlight=caprover#caprover"
                >
                  the Quick start documentation
                </a>.
              </strong>
            </div>
          {/if}
        {/each}
      </section>
      <section style={display(active, "leader")}>
        {#each baseFields as field (field.symbol)}
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
      </section>
      <section style={display(active, "workers")}>
        <AddBtn on:click={() => (data.workers = [...data.workers, new CapWorker()])} />
        <div class="nodes-container">
          {#each data.workers as worker, index (worker.id)}
            <div class="box">
              <DeleteBtn
                name={worker.name}
                on:click={() => (data.workers = data.workers.filter((_, i) => index !== i))}
              />
              {#each baseFields as field (field.symbol)}
                {#if field.invalid !== undefined}
                  <Input bind:data={worker[field.symbol]} bind:invalid={field.invalid} {field} />
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
                {profile}
                on:fetch={({ detail }) => (worker.selection.nodes = detail)}
                nodes={worker.selection.nodes}
              />
            </div>
          {/each}
        </div>
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
      4- Insert worker node public IP <strong>{workerIp}</strong> and add your private SSH Key<br />
      5- Click <strong>Join cluster</strong> button<br />
      <br />
      <strong>
        <a target="_blank" href="https://library.threefold.me/info/manual/#/manual__weblets_caprover_worker">
          Click here for the documentation
        </a>
      </strong>
      <div style="float: right; margin-top: 50px;">
        <button class="button is-danger" on:click|stopPropagation={() => (workerData = !workerData)}>Close</button>
      </div>
    </section>
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import "../../assets/global.scss";
</style>
