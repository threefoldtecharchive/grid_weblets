<svelte:options tag={null} />

<script lang="ts">
  import type { IFormField } from "../../types";
  import DeployedList from "../../types/deployedList";

  export let tab: "k8s" | "vm" | "caprover" = undefined;

  // prettier-ignore
  const tabs = [
    { label: "Kubernetes" },
    { label: "Virtual Machines" },
    { label: "Caprover" }
  ];
  let active: string = "Kubernetes";

  const data = window.configs.baseConfig;
  let loading = false;
  let configed = false;
  let list: DeployedList;
  let password: string = "";

  // prettier-ignore
  const configFields: IFormField[] = [
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Mnemonics of your tfchain account" },
    { label: "Store Secret", symbol: "storeSecret", placeholder: "secret key used for data encryption" },
  ];


  function onConfigHandler() {
    configed = true;
    loading = true;
    DeployedList.init($data)
      .then((_list) => {
        list = _list;
        // console.log(list);
      })
      // .catch((err) => {
      //   console.log("Error", err);
      // })
      .finally(() => (loading = false));
  }

  async function loadCaprover() {
    const machines = await list.load("machines");
    return machines.filter(([m]) => {
      return m.name.startsWith("caprover_leader");
    });
  }
</script>

<div style="padding: 15px;">
  <section class="box">
    <h4 class="is-size-4 mb-4">
      List Deployed
      {#if tab === "k8s" || tab === "vm" || tab === "caprover"}
        {tab.toLocaleUpperCase()}
      {:else}
        Elements
      {/if}
    </h4>
    <hr />

    {#if loading}
      <p style="text-align: center; mt-2 mb-2">Loading...</p>
    {:else if !configed}
      <form on:submit|preventDefault={onConfigHandler}>
        <div
          class="select mb-4"
          style="display: flex; justify-content: flex-end;"
        >
          <select bind:value={$data.networkEnv}>
            <option value="test">Testnet</option>
            <option value="dev">Devnet</option>
          </select>
        </div>
        {#if $data.loaded === false}
          <div style="display: flex; align-items: center;">
            <div class="field mr-2" style="width: 100%">
              <p class="label">Configs Password</p>
              <div class="control">
                <input
                  class="input"
                  type="text"
                  placeholder="Your Configs Password"
                  bind:value={password}
                />
              </div>
            </div>
            <div>
              <button
                type="button"
                class="button is-primary is-outlined mb-2"
                disabled={password === ""}
                on:click={() => {
                  data.load(password);
                }}
              >
                Load
              </button>
              <button
                type="button"
                class="button is-success"
                disabled={password === ""}
                on:click={() => {
                  data.save(password);
                }}
              >
                Save
              </button>
            </div>
          </div>
        {/if}
        {#each configFields as field (field.symbol)}
          <div class="field">
            <p class="label">{field.label}</p>
            <div class="control">
              <input
                class="input"
                type="text"
                placeholder={field.placeholder}
                bind:value={data[field.symbol]}
              />
            </div>
          </div>
        {/each}
        <div style="display: flex; justify-content: center;">
          <button
            disabled={$data.mnemonics === "" || $data.storeSecret === ""}
            type="submit"
            class="button is-primary"
          >
            List Elements
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
        {#await list.load("k8s")}
          <div class="notification is-info mt-2">&gt; Loading...</div>
        {:then rows}
          <div class="table-container mt-2">
            <table class="table">
              <thead>
                <tr>
                  <th title="position">#</th>
                  <th>Name</th>
                  <th>Public IP</th>
                  <th>Yggdrasil IP</th>
                  <th>Workers</th>
                </tr>
              </thead>
              <tbody>
                {#each rows as row, idx}
                  <tr>
                    <th>{idx + 1}</th>
                    <td>{row.masters[0].name}</td>
                    {#if row.masters[0].publicIP}
                      <td>{row.masters[0].publicIP.ip}</td>
                    {:else}
                      <td>-</td>
                    {/if}
                    <td>{row.masters[0].yggIP}</td>
                    <td>{row.workers.length}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:catch err}
          <div class="notification is-danger mt-2">
            &gt;
            {#if err && err.message}
              {err.message}
            {:else}
              Failed to list {active}.
            {/if}
          </div>
        {/await}
      {/if}

      {#if active === "Virtual Machines" || active === "Caprover" || tab === "caprover" || tab === "vm"}
        {#await active === "Caprover" || tab === "caprover" ? loadCaprover() : list.load("machines")}
          <div class="notification is-info mt-2">&gt; Loading...</div>
        {:then rows}
          <div class="table-container mt-2">
            <table class="table">
              <thead>
                <tr>
                  <th title="position">#</th>
                  <th>Name</th>
                  <th>Public IP</th>
                  <th>Yggdrasil IP</th>
                  <th>Flist</th>
                </tr>
              </thead>
              <tbody>
                {#each rows as [row], idx}
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
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:catch err}
          <div class="notification is-danger mt-2">
            &gt;
            {#if err && err.message}
              {err.message}
            {:else}
              Failed to list {active}.
            {/if}
          </div>
        {/await}
      {/if}
    {/if}
  </section>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .table {
    width: 100%;
  }
</style>
