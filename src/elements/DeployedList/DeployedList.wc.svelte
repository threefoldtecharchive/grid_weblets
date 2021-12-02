<svelte:options tag="tf-deployedlist" />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { IProfile } from "../../types/Profile";
  import type { ITab } from "../../types";
  import DeployedList from "../../types/deployedList";
  import deleteContracts from "../../utils/deleteContracts";

  type TabsType = "k8s" | "vm" | "caprover" | "funkwhale" | "peertube";
  export let tab: TabsType = undefined;

  // components
  import Modal from "../../components/DeploymentModal.svelte";
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import Table from "../../components/Table.svelte";

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Kubernetes", value: "k8s" },
    { label: "Virtual Machines", value: "vm" },
    { label: "Caprover", value: "caprover" },
    { label: "FunkWhale", value: "funkwhale" },
    { label: "Peertube", value: "peertube" }
  ];
  let active: string = "k8s";

  let loading = false;
  let configed = false;
  let list: DeployedList;
  const deployedStore = window.configs?.deploymentStore;

  let profile: IProfile;

  function onConfigHandler() {
    configed = true;
    loading = true;
    DeployedList.init(profile)
      .then((_list) => {
        list = _list;
      })
      .finally(() => (loading = false));
  }

  function _reloadTab() {
    const x = active;
    active = "";

    const y = tab;
    tab = undefined;
    requestAnimationFrame(() => {
      active = x;
      tab = y;
    });
  }

  let removed: string[] = [];
  function onRemoveHandler(key: "k8s" | "machines", name: string) {
    const remove = window.confirm(`Are you sure u want to delete '${name}'?`);
    if (!remove) return;
    removed = [...removed, name];
    const idx = removed.length - 1;
    deleteContracts(profile, key, name)
      .then((data) => {
        console.log("Removed", data);
        if (data.deleted.length === 0) {
          removed.splice(idx, 1);
          removed = removed;
        }
        _reloadTab();
      })
      .catch((err) => {
        console.log("Error while removing", err);
      });
  }

  let infoToShow: Object;

  let _sub: any;
  onMount(() => {
    _sub = deployedStore.subscribe(() => {
      _reloadTab();
    });
  });

  onDestroy(() => {
    _sub();
    list?.grid.disconnect();
  });

  let _loadData: string;

  // prettier-ignore
  $: {
    if (active === "caprover" || tab === "caprover") _loadData = "loadCaprover";
    else if (tab === "vm" || active === "vm") _loadData = "loadVm";
    else if (tab === "funkwhale" || active === "funkwhale") _loadData = "loadFunkwhale";
    else if (active === "peertube" || tab === "peertube") _loadData = "loadPeertube";
  }

  // prettier-ignore
  // function loadData() {
  //   if (active === "caprover" || tab === "caprover") return list.loadCaprover();
  //   if (tab === "vm" || active === "vm") return list.loadVm();
  //   if (tab === "funkwhale" || active === "funkwhale") return list.loadFunkwhale();
  //   if (active === "peertube" || tab === "peertube") return list.loadPeertube();
  //   return Promise.resolve([]);
  // }
  const tabNames = tabs.map(({ value }) => value);
</script>

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
    if (detail) {
      onConfigHandler();
    }
  }}
/>

<!-- prettier-ignore -->
<Table 
  headers={["Pos", "Team", "Pld", "W", "D", "L", "GF", "GA", "GD", "Pts", "Qualification or relegation"]}
  rows={[
    ["1",	"Leicester City (C)",	"38",	"23",	"12",	"3",	"68",	"36",	"+32",	"81",	"Qualification for the Champions League group stage"],
    ["1",	"Leicester City (C)",	"38",	"23",	"12",	"3",	"68",	"36",	"+32",	"81",	"Qualification for the Champions League group stage"],
    ["1",	"Leicester City (C)",	"38",	"23",	"12",	"3",	"68",	"36",	"+32",	"81",	"Qualification for the Champions League group stage"],
  
  ]}
  actions={[
    {
      type: "info",
      label: "Delete",
      click(e) {
        console.log(e);
      }
    },
    {
      type: "danger",
      label: "Delete",
      click(e) {
        console.log(e);
      }
    },
    {
      type: "success",
      label: "Delete",
      click(e) {
        console.log(e);
      }
    },
    {
      type: "warning",
      label: "Delete",
      click(e) {
        console.log(e);
      }
    },
  ]}
/>

<!-- <div style="padding: 15px;">
  <section class="box">
    <h4 class="is-size-4 mb-4">
      Deployment List
      {#if tabNames.includes(tab)}
        ({tab})
      {/if}
    </h4>
    <hr />

    {#if loading}
      <p style="text-align: center; mt-2 mb-2">Loading...</p>
    {:else if !configed}
      <p style="text-align: center; mt-2 mb-2">
        Please activate a profile from profile manager
      </p>
    {:else}
      {#if !tabNames.includes(tab)}
        <Tabs bind:active {tabs} />
      {/if}

      {#if (!tab && active === "k8s") || tab === "k8s"}
        {#await list.loadK8s()}
          <div class="notification is-info mt-2">Loading...</div>
        {:then rows}
          {#if rows.length}
            <div class="table-container mt-2">
              <table class="table">
                <thead>
                  <tr>
                    <th title="position">#</th>
                    <th>Name</th>
                    <th>Public IP</th>
                    <th>Planetary Network IP</th>
                    <th>Workers</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each rows as row, idx}
                    <tr>
                      <th>{idx + 1}</th>
                      <td>{row.name}</td>
                      {#if row.master.publicIP}
                        <td>{row.master.publicIP.ip}</td>
                      {:else}
                        <td>-</td>
                      {/if}
                      <td>{row.master.yggIP}</td>
                      <td>{row.workers}</td>
                      <td class="is-flex">
                        <button
                          class="button is-outlined is-primary mr-2"
                          on:click={() => {
                            infoToShow = row.details;
                          }}
                          disabled={removed.includes(row.name)}
                        >
                          Show Details
                        </button>
                        <button
                          class={"button is-danger " +
                            (removed.includes(row.name) ? "is-loading" : "")}
                          on:click={() => onRemoveHandler("k8s", row.name)}
                          disabled={removed.includes(row.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p style="text-align: center;" class="mt-2">
              No Deployments was found on this profile.
            </p>
          {/if}
        {:catch err}
          <div class="notification is-danger mt-2">
            &gt;
            {#if err && err.message}
              {err.message}
            {:else if typeof err === "string"}
              {err}
            {:else}
              Failed to list {active}.
            {/if}
          </div>
        {/await}
      {/if}

      {#if _loadData && (active === "vm" || active === "caprover" || tab === "caprover" || tab === "vm" || tab === "funkwhale" || active === "funkwhale" || active === "peertube" || tab === "peertube")}
        {#await list[_loadData]()}
          <div class="notification is-info mt-2">&gt; Loading...</div>
        {:then rows}
          {#if rows.length}
            <div class="table-container mt-2">
              <table class="table">
                <thead>
                  <tr>
                    <th title="position">#</th>
                    <th>Name</th>
                    <th>Public IP</th>
                    <th>Planetary Network IP</th>
                    <th>Flist</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each rows as row, idx}
                    {#if row.name}
                      <tr>
                        <th>{idx + 1}</th>
                        <td>{row.name}</td>
                        {#if row.publicIP}
                          <td>{row.publicIP.ip}</td>
                        {:else}
                          <td>-</td>
                        {/if}
                        <td>{row.yggIP}</td>
                        <td>{row.flist}</td>
                        <td class="is-flex">
                          <button
                            class="button is-outlined is-primary"
                            on:click={() => {
                              infoToShow = row.details;
                            }}
                            disabled={removed.includes(row.name)}
                          >
                            Show Details
                          </button>
                          <button
                            class={"button is-danger ml-2" +
                              (removed.includes(row.name) ? "is-loading" : "")}
                            on:click={() =>
                              onRemoveHandler("machines", row.name)}
                            disabled={removed.includes(row.name)}
                          >
                            Delete
                          </button>
                          {#if row.details.env && row.details.env.CAPROVER_ROOT_DOMAIN}
                            <a
                              class="ml-2"
                              target="_blank"
                              href={"http://captain." +
                                row.details.env.CAPROVER_ROOT_DOMAIN}
                              disabled={removed.includes(row.details.name)}
                            >
                              <button class="button is-link">
                                Admin Panel
                              </button>
                            </a>
                          {/if}
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p style="text-align: center;" class="mt-2">
              No Deployments was found on this profile.
            </p>
          {/if}
        {:catch err}
          <div class="notification is-danger mt-2">
            &gt;
            {#if err && err.message}
              {err.message}
            {:else if typeof err === "string"}
              {err}
            {:else}
              Failed to list {active}.
            {/if}
          </div>
        {/await}
      {/if}
    {/if}
  </section>
</div> -->

{#if infoToShow}
  <Modal data={infoToShow} on:closed={() => (infoToShow = null)} />
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .table {
    width: 100%;
  }
</style>
