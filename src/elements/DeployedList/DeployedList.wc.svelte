<svelte:options tag={null} />

<script lang="ts">
  import type { IFormField } from "../../types";
  import BaseConfig from "../../types/baseConfig";
  import DeployedList from "../../types/deployedList";

  // prettier-ignore
  const tabs = [
    { label: "Kubernetes" },
    { label: "Virtual Machines" },
  ];
  let active: string = "Kubernetes";

  const data = new BaseConfig(
    "wss://tfchain.dev.threefold.io/ws",
    undefined,
    "fiscal play spin all describe because stem disease coral call bronze please"
  );
  let loading = false;
  let configed = false;
  let list: DeployedList;

  // prettier-ignore
  const configFields: IFormField[] = [
    { label: "Proxy URL", symbol: "proxyURL", placeholder: "Your Proxy URL." },
    { label: "URL", symbol: "url", placeholder: "Your substrate URL." },
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Your Mnemonics." },
  ];

  function onConfigHandler() {
    configed = true;
    loading = true;
    DeployedList.init(data)
      .then((_list) => {
        list = _list;
        console.log(list);
      })
      .finally(() => (loading = false));
  }
</script>

<div style="padding: 15px;">
  <section class="box">
    <h4 class="is-size-4 mb-4">List Deployed Elements</h4>
    <hr />

    {#if loading}
      <p style="text-align: center; mt-2 mb-2">Loading...</p>
    {:else if !configed}
      <form on:submit|preventDefault={onConfigHandler}>
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
            disabled={!data.valid}
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
      </div>

      {#if active === "Kubernetes"}
        {#await list.load("k8s")}
          <p class="mt-2">&gt; Loading...</p>
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
                      <td>{row.masters[0].publicIP.gateway}</td>
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
        {/await}
      {/if}

      {#if active === "Virtual Machines"}
        {#await list.load("machines")}
          <p class="mt-2">&gt; Loading...</p>
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
                      <td>{row.publicIP.gateway}</td>
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
