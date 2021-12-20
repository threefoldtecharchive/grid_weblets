<svelte:options tag="tf-contractslist" />

<script lang="ts">
  import getGrid from "../../utils/getGrid";
  import type { IProfile } from "../../types/Profile";

  // components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Alert from "../../components/Alert.svelte";
  import Table from "../../components/Table.svelte";
  import { noActiveProfile } from "../../utils/message";

  import type { IContract } from "../../utils/getContractsConsumption";
  import getContractsConsumption from "../../utils/getContractsConsumption";

  let profile: IProfile;
  let contracts: IContract[] = [];
  let loading: boolean = false;
  let selectedContracts: IContract[] = [];
  let deleting: boolean = false;
  let deletingType: "all" | "selected" = null;
  let selectedRows: number[] = [];

  function onLoadProfile(_profile: IProfile) {
    profile = _profile;
    if (profile) {
      loading = true;
      return getGrid(profile, (grid) => {
        grid.contracts
          .listMyContracts()
          .then(({ nameContracts, nodeContracts }) => {
            const names = nameContracts.map(({ contractId }) => ({ id: contractId, type: "name" } as IContract)); // prettier-ignore
            const nodes = nodeContracts.map(({ contractId }) => ({ id: contractId, type: "node" } as IContract)); // prettier-ignore
            contracts = [...names, ...nodes];
          })
          .catch((err) => {
            console.log("Error", err);
          })
          .finally(() => {
            loading = false;
          });
      });
    } else {
      contracts = [];
    }
  }

  let message: string;
  function onDeleteHandler() {
    if (!window.confirm("Are you sure you want to delete your contracts?"))
      return;

    message = null;
    deleting = true;
    deletingType = "all";
    return getGrid(profile, (grid) => {
      grid.contracts
        .cancelMyContracts()
        .then(() => {
          contracts = [];
        })
        .catch((err) => {
          console.log("Error", err);
          message = err.message || err;
        })
        .finally(() => {
          selectedRows = [];
          deleting = false;
          deletingType = null;
        });
    });
  }

  function onDeleteSelectedHandler() {
    if (selectedContracts.length === contracts.length) return onDeleteHandler();

    // prettier-ignore
    if (!window.confirm("Are you sure you want to delete the selected contracts?")) return;

    message = null;
    deleting = true;
    deletingType = "selected";
    return getGrid(profile, async (grid) => {
      for (const contract of selectedContracts) {
        try {
          await grid.contracts.cancel({ id: contract.id });
        } catch (err) {
          console.log("Error", err);
          message = err.message || err;
        }
      }
      contracts = contracts.filter((c) => {
        return selectedContracts.findIndex((sc) => sc.id === c.id) === -1;
      });
      selectedRows = [];
      deleting = false;
      deletingType = null;
    });
  }

  let loadingConsumption: boolean = false;
  let consumptions: string[] = [];
  $: {
    if (profile) {
      loadingConsumption = true;
      getContractsConsumption(profile, contracts)
        .then((res) => {
          consumptions = res as unknown as string[];
        })
        .catch((err) => {
          console.log("Error", err);
        })
        .finally(() => {
          loadingConsumption = false;
        });
    }
  }
</script>

<SelectProfile on:profile={({ detail }) => onLoadProfile(detail)} />

<div style="padding: 15px;">
  <div class="box">
    <h4 class="is-size-4 mb-4">Contracts List</h4>
    <hr />

    {#if loading}
      <Alert type="info" message="Loading Contracts..." />
    {:else if contracts.length}
      <Table
        rowsData={contracts}
        headers={["#", "ID", "Type", "Billing Rate"]}
        rows={contracts.map(({ id, type }, idx) => [
          idx.toString(),
          id.toString(),
          type,
          loadingConsumption ? "Loading..." : consumptions[idx],
        ])}
        on:selected={({ detail }) => (selectedContracts = detail)}
        {selectedRows}
      />
      <div
        class="is-flex is-justify-content-space-between is-align-items-center"
      >
        <div style="flex-grow: 1;" class="mr-2">
          {#if message}
            <Alert type="danger" {message} />
          {/if}
        </div>
        <div>
          <button
            class={"button is-danger is-outlined mr-2 " +
              (deleting && deletingType === "selected" ? "is-loading" : "")}
            disabled={!profile ||
              loading ||
              deleting ||
              contracts.length === 0 ||
              selectedContracts.length === 0}
            on:click={onDeleteSelectedHandler}
          >
            Delete Selected
          </button>
          <button
            class={"button is-danger " +
              (deleting && deletingType === "all" ? "is-loading" : "")}
            disabled={!profile || loading || deleting || contracts.length === 0}
            on:click={onDeleteHandler}
          >
            Delete All
          </button>
        </div>
      </div>
    {:else}
      <Alert
        type="info"
        message={!profile ? noActiveProfile : "No contracts were found"}
      />
    {/if}
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>