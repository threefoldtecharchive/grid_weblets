<svelte:options tag="tf-update-caprover" />

<script lang="ts">
  // libs
  import type { IProfile } from "../types/Profile";
  import type { IFormField, IPackage } from "../types";
  import validateName, { isInvalid } from "../utils/validateName"; // prettier-ignore
  const currentDeployment = window.configs?.currentDeploymentStore;

  // components
  import Alert from "./Alert.svelte";
  import Input from "./Input.svelte";
  import SelectNodeId from "./SelectNodeId.svelte";
  import DeployBtn from "./DeployBtn.svelte";
  import { createEventDispatcher } from "svelte";
  import Table from "./Table.svelte";
  import rootFs from "../utils/rootFs";
  import { deployWorker } from "../utils/deployCaprover";
  import { CapWorker } from "../types/caprover";
    import SelectCapacity from "./SelectCapacity.svelte";

  const dispatch = createEventDispatcher<{ closed: boolean }>();

  export let profile: IProfile;
  export let capRover: any;

  let workers: any[] = [];
  //$: if (capRover) workers = capRover.workers;

  let shouldBeUpdated: boolean = false;
  let loading: boolean = false;
  let message: string;
  let success: boolean = false;
  let failed: boolean = false;
  let removing: string = null;

  let worker = new CapWorker();
  // prettier-ignore
  const workerFields: IFormField[] = [ 
    { label: "Name", symbol: "name", placeholder: "Worker instance name", type: "text", validator: validateName, invalid: false },
  ];

  const packages: IPackage[] = [
    { name: "Minimum", cpu: 1, memory: 1024, diskSize: 50 },
    { name: "Standard", cpu: 2, memory: 1024 * 2, diskSize: 100 },
    { name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 250 },
  ];

  $: worker.publicKey = profile.sshKey;
  $: disabled = loading || isInvalid(workerFields) || !worker.valid; // prettier-ignore
  $: logs = $currentDeployment;

  function onAddWorker() {
    loading = true;
    currentDeployment.deploy("Add Worker", worker.name);

    const publicIP = capRover["publicIp"].split("/")[0];
    const password = capRover["details"]["env"]["DEFAULT_PASSWORD"];

    deployWorker(publicIP, password, worker, profile)
    .then((data) => {
      if (data) {
        success = true;
        shouldBeUpdated = true;
        worker = new CapWorker();
        return data;
      } else {
        failed = true;
      }
    })
    .then((data) => {
      if (!data) return;
      workers = [];//data.workers;
    })
    .catch((err) => {
        failed = true;
        console.log("Error", err);
        message = err.message || err;
    })
    .finally(() => {
        loading = false;
        currentDeployment.clear();
    });
  }

  const style = `
<style>
  .modal-content {
    width: calc(100% - 30px);
    max-height: 70vh;
    transform: translateY(30px);
    background-color: white;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background-color: #d3d3d3;
  }
  
  .modal-content::-webkit-scrollbar {
    width: 10px;
  }

  .content {
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #fff;
  }

  .modal-content > div,
  .content {
    width: 100%;
  }

</style>
`;
  function _createWorkerRows(workers: any[]) {
    // prettier-ignore
    workers.sort(
      (a, b) => a.created - b.created
    )
    return workers.map((worker, i) => {
      const {
        contractId,
        name,
        planetary,
        capacity: { cpu, memory },
        mounts: [{ size }],
      } = worker;
      return [
        i + 1,
        contractId,
        name,
        planetary,
        cpu,
        memory,
        size / (1024 * 1024 * 1024),
      ];
    });
  }
</script>

<div>
  {@html style}
</div>

<div class="modal is-active">
  <div
    class="modal-background"
    on:click|preventDefault={() => {
      if (!loading) {
        dispatch("closed", shouldBeUpdated);
      }
    }}
  />

  {#if capRover}
    <div
      class="modal-content"
      style="width: fit-content"
      on:click|stopPropagation
    >
      <div class="box">
        <h4 class="is-size-4">
          Manage CapRover({capRover.name}) Workers
        </h4>

        {#if workers.length}
          <hr />
          <Table
            rowsData={workers}
            headers={[
              "#",
              "Contract ID",
              "Name",
              "Planetary Network IP",
              "CPU(vCores)",
              "Memory(MB)",
              "Disk(GB)",
            ]}
            rows={_createWorkerRows(workers)}
          />
          <hr />
        {:else}
          <hr style="width: 1200px" />
        {/if}

        <form on:submit|preventDefault={onAddWorker}>
          {#if loading || (logs !== null && logs.type === "Add Worker")}
            <Alert type="info" message={logs?.message ?? "Loading..."} />
          {:else if success}
            <Alert type="success" message="Successfully Added Worker." />
          {:else if failed}
            <Alert type="danger" message={message || "Failed to Add Worker."} />
          {:else}
            {#each workerFields as field (field.symbol)}
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
                bind:status={worker.status}
                filters={worker.selection.filters}
                {profile}
                on:fetch={({ detail }) => (worker.selection.nodes = detail)}
                nodes={worker.selection.nodes}
              />
          {/if}
          <DeployBtn
            label="Add Worker"
            loading={loading && removing === null}
            {success}
            {failed}
            disabled={disabled && !failed && !success}
            on:click={(e) => {
              if (success || failed) {
                e.preventDefault();
                success = false;
                failed = false;
                loading = false;
                message = null;
              }
            }}
          />
        </form>
      </div>
    </div>
  {/if}
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
