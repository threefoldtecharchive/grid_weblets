<svelte:options tag="tf-deployedlist" />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  import DeployedList from "../../types/deployedList";
  import deleteContracts from "../../utils/deleteContracts";

  export let tab: "k8s" | "vm" | "caprover" = undefined;

  // prettier-ignore
  const tabs = [
    { label: "Kubernetes" },
    { label: "Virtual Machines" },
    { label: "Caprover" }
  ];
  let active: string = "Kubernetes";

  let loading = false;
  let configed = false;
  let list: DeployedList;
  const configs = window.configs?.baseConfig;
  const deployedStore = window.configs?.deploymentStore;
  let profileIdx: number = 0;

  $: profiles = $configs;
  $: profile = $configs[profileIdx];

  function onConfigHandler() {
    configed = true;
    loading = true;
    DeployedList.init(profile)
      .then((_list) => {
        list = _list;
      })
      .finally(() => (loading = false));
  }

  const onSelectProfile = (e: Event) => profileIdx = (e.target as any).selectedIndex; // prettier-ignore

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

  let infoToShow: string = "";

  let _sub: any;
  onMount(() => {
    _sub = deployedStore.subscribe((data) => {
      _reloadTab();
    });
  });

  onDestroy(() => {
    _sub();
  });
</script>

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
      <form on:submit|preventDefault={onConfigHandler}>
        <div style="display: flex; justify-content: center;">
          <div
            class="select mb-4"
            style="display: flex; justify-content: flex-end;"
          >
            <select on:change={onSelectProfile}>
              {#each profiles as profile, idx (idx)}
                <option value={idx}
                  >{#if profile.name}
                    {profile.name}
                  {:else}
                    Profile {idx + 1}
                  {/if}</option
                >
              {/each}
            </select>
          </div>
        </div>
        <div style="display: flex; justify-content: center;">
          <button
            disabled={!profile ||
              profile.mnemonics === "" ||
              profile.storeSecret === ""}
            type="submit"
            class="button is-primary"
          >
            List
          </button>
        </div>
      </form>
      <!--  -->
    {:else}
      <!--  -->
      <div style="display: flex">
        <button
          class="button is-primary is-outlined mr-2"
          on:click={() => (configed = false)}
        >
          Back
        </button>

        {#if !tab}
          <div style="width: 100%;">
            <div class="tabs is-centered">
              <ul>
                {#each tabs as tab (tab.label)}
                  <li class={active === tab.label ? "is-active" : ""}>
                    <a
                      href="#!"
                      on:click|preventDefault={() => (active = tab.label)}
                    >
                      <span>{tab.label}</span>
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/if}
      </div>

      {#if (!tab && active === "Kubernetes") || tab === "k8s"}
        {#await list.loadK8s()}
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
                      <td>
                        <button
                          class="button is-outlined is-primary ml-2"
                          on:click={() => {
                            infoToShow = JSON.stringify(
                              row.details,
                              undefined,
                              4
                            );
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

      {#if active === "Virtual Machines" || active === "Caprover" || tab === "caprover" || tab === "vm"}
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
                  {#if row.name }
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
                      <td>
                        <button
                          class="button is-outlined is-primary  ml-2"
                          on:click={() => {
                            infoToShow = JSON.stringify(row, undefined, 4);
                          }}
                          disabled={removed.includes(row.name)}
                        >
                          Show Details
                        </button>
                        <button
                          class={"button is-danger " +
                            (removed.includes(row.name) ? "is-loading" : "")}
                          on:click={() => onRemoveHandler("machines", row.name)}
                          disabled={removed.includes(row.name)}
                        >
                          Delete
                        </button>
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
  <div class="modal is-active">
    <div class="modal-background" />
    <div class="modal-content">
      <div class="box" style="white-space: pre;">
        {infoToShow}
      </div>
    </div>
    <button
      class="modal-close is-large"
      aria-label="close"
      on:click={() => (infoToShow = "")}
    />
  </div>
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .table {
    width: 100%;
  }
</style>
