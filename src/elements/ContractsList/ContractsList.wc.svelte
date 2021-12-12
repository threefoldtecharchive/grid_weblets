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
  let deleting: boolean = false;

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
    if (!window.confirm("Are you sure u want to delete your contracts ?"))
      return;

    deleting = true;
    return getGrid(profile, (grid) => {
      grid.contracts
        .cancelMyContracts()
        .then()
        .catch((err) => {
          console.log("Error", err);
        })
        .finally(() => {
          contracts = [];
          deleting = false;
        });
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
        headers={["#", "id", "type"]}
        rows={contracts.map(({ id, type }, idx) => [
          idx.toString(),
          id.toString(),
          type,
        ])}
      />
      <div class="is-flex is-justify-content-flex-end">
        <button
          class={"button is-danger " + (deleting ? "is-loading" : "")}
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
