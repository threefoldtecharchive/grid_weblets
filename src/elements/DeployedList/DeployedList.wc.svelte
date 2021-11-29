<svelte:options tag="tf-deployedlist" />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { IProfile } from "../../types/Profile";
  import type { ITab } from "../../types";
  import DeployedList from "../../types/deployedList";
  import deleteContracts from "../../utils/deleteContracts";

  export let tab: "k8s" | "vm" | "caprover" = undefined;

  // components
  import Modal from "../../components/DeploymentModal.svelte";
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Tabs from "../../components/Tabs.svelte";

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Kubernetes", value: "k8s" },
    { label: "Virtual Machines", value: "vm" },
    { label: "Caprover", value: "caprover" }
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
  });
</script>

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
    if (detail) {
      onConfigHandler();
    }
  }}
/>
<div style="padding: 15px;">
  <section class="box">
    <h4 class="is-size-4 mb-4">
      Deployment List
      {#if tab === "k8s" || tab === "vm" || tab === "caprover"}
        ({tab.toLocaleUpperCase()})
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
      {#if tab === "k8s" || tab === "vm" || tab === "caprover"}
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

      {#if active === "vm" || active === "caprover" || tab === "caprover" || tab === "vm"}
        {#await active === "Caprover" || tab === "caprover" ? list.loadCaprover() : list.loadVm()}
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
</div>

{#if infoToShow}
  <Modal data={infoToShow} on:closed={() => (infoToShow = null)} />
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .table {
    width: 100%;
  }
</style>
