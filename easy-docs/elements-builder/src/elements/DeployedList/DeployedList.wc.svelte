<script lang="ts">
  import type { IFormField } from "../../types";
  import BaseConfig from "../../types/baseConfig";
  import DeployedList from "../../types/deployedList";

  // prettier-ignore
  const tabs = [
    { label: "Kubernetes", icon: "fab fa-docker" },
    { label: "Virtual Machines", icon: "fas fa-server" },
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

<section class="box">
  <h4 class="is-size-4 mb-4">List Deployed Elements</h4>

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
        <button disabled={!data.valid} type="submit" class="button is-primary">
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
        <span class="icon is-small">
          <i class="fas fa-arrow-left" />
        </span>
      </button>
      <div style="width: 100%;">
        <div class="tabs is-centered is-boxed is-medium">
          <ul>
            {#each tabs as tab (tab.label)}
              <li class={active === tab.label ? "is-active" : ""}>
                <a
                  href="#!"
                  on:click|preventDefault={() => (active = tab.label)}
                >
                  <span class="icon is-small">
                    <i class={tab.icon} aria-hidden="true" />
                  </span>
                  <span>{tab.label}</span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

    {#if active === "Kubernetes"}
      {JSON.stringify(list.kubernetes)}
    {/if}

    {#if active === "Virtual Machines"}
      {JSON.stringify(list.vms)}
    {/if}
  {/if}
</section>
