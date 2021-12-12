<svelte:options tag="tf-contractslist" />

<script lang="ts">
  import getGrid from "../../utils/getGrid";
  import type { IProfile } from "../../types/Profile";

  // components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Alert from "../../components/Alert.svelte";
  import Table from "../../components/Table.svelte";

  interface IContract {
    id: number;
    type: "name" | "node";
  }

  let profile: IProfile;
  let contracts: IContract[] = [];
  let loading: boolean = false;
  let selectedContracts: IContract[] = [];
  let deleting: boolean = false;
  let deletingType: "all" | "selected" = null;

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

  function onDeleteHandler() {
    if (!window.confirm("Are you sure u want to delete your contracts?"))
      return;

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
        })
        .finally(() => {
          deleting = false;
          deletingType = null;
        });
    });
  }

  function onDeleteSelectedHandler() {
    // prettier-ignore
    if (!window.confirm("Are you sure u want to delete the selected contracts?")) return;

    deleting = true;
    deletingType = "selected";
    return getGrid(profile, async (grid) => {
      try {
        for (const contract of selectedContracts) {
          await grid.contracts.cancel({ id: contract.id });
        }
        deleting = false;
        deletingType = null;
        const ids = selectedContracts.map(({ id }) => id);
        contracts = contracts.filter((c) => !ids.includes(c.id));
      } catch (err) {
        console.log("Error", err);
      }
    });
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
        headers={["#", "id", "type"]}
        rows={contracts.map(({ id, type }, idx) => [
          idx.toString(),
          id.toString(),
          type,
        ])}
        on:selected={({ detail }) => (selectedContracts = detail)}
      />
      <div class="is-flex is-justify-content-flex-end">
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
    {:else}
      <Alert
        type="info"
        message={!profile
          ? "Please select a profile"
          : "No contracts were found"}
      />
    {/if}
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
