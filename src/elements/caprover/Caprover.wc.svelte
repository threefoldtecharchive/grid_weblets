<svelte:options tag={null} />

<script lang="ts">
  import type { IFormField } from "../../types";
  import { default as Caprover } from "../../types/caprover";
  import deployCaprover from "../../utils/deployCaprover";
  const { events } = window.configs?.grid3_client ?? {};

  const data = new Caprover();
  let loading = false;
  let success = false;
  let failed = false;

  // prettier-ignore
  const tabs = [
    { label: "Base" },
    { label: "Configs" },
  ];
  let active = "Base";

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Your caprover name" },
    { label: "CPU", symbol: "cpu", placeholder: "CPU Size", type: "number" },
    { label: "Memory", symbol: 'memory', placeholder: "Memory Size", type: "number" },
    { label: "Node ID", symbol: "nodeId", placeholder: "Node Id", type: "number" },
    { label: "Disk Size", symbol: "diskSize", placeholder: "Your Disk Size.", type: "number" },
    { label: "Domain", symbol: "domain", placeholder: "Your domain." },
    { label: "Public Key", symbol: "publicKey", placeholder: "Your Public Key." }
  ];

  // prettier-ignore
  const configFields: IFormField[] = [
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Your Mnemonics." },
    { label: "Store Secret", symbol: "storeSecret", placeholder: "Your Store Secret." },
  ];

  let message: string;
  function deployCaproverHandler() {
    loading = true;
    success = false;
    failed = false;

    function onLogInfo(msg: string) {
      if (typeof msg === "string") {
        message = msg;
      }
    }

    events.addListener("logs", onLogInfo);

    deployCaprover(data)
      .then(() => (success = true))
      .catch((err) => {
        failed = true;
        console.log("Error", err);
      })
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
  }
</script>

<div style="padding: 15px;">
  <form class="box" on:submit|preventDefault={deployCaproverHandler}>
    <h4 class="is-size-4 mb-4">Caprover Deployer</h4>
    <hr />

    {#if loading}
      <div class="notification is-info">
        {#if message}
          &gt; {message}.
        {:else}
          &gt; Loading...
        {/if}
      </div>
    {:else if success}
      <div class="notification is-success">
        &gt; Successfully deployed Caprover.
      </div>
    {:else if failed}
      <div class="notification is-danger">&gt; Failed to deploy Caprover.</div>
    {:else}
      <div
        class="select mb-4"
        style="display: flex; justify-content: flex-end;"
      >
        <select bind:value={data.configs.networkEnv}>
          <option value="test">Testnet</option>
          <option value="dev">Devnet</option>
        </select>
      </div>
      <div class="tabs is-centered">
        <ul>
          {#each tabs as tab (tab.label)}
            <li class={active === tab.label ? "is-active" : ""}>
              <a href="#!" on:click|preventDefault={() => (active = tab.label)}>
                <span>{tab.label}</span>
              </a>
            </li>
          {/each}
        </ul>
      </div>

      {#if active === "Base"}
        {#each fields as field (field.symbol)}
          <div class="field">
            <p class="label">{field.label}</p>
            <div class="control">
              {#if field.type === "number"}
                <input
                  class="input"
                  type="number"
                  placeholder={field.placeholder}
                  bind:value={data[field.symbol]}
                />
              {:else}
                <input
                  class="input"
                  type="text"
                  placeholder={field.placeholder}
                  bind:value={data[field.symbol]}
                />
              {/if}
            </div>
          </div>
        {/each}
      {/if}

      {#if active === "Configs"}
        {#each configFields as field (field.symbol)}
          <div class="field">
            <p class="label">{field.label}</p>
            <div class="control">
              {#if field.type === "number"}
                <input
                  class="input"
                  type="number"
                  placeholder={field.placeholder}
                  bind:value={data.configs[field.symbol]}
                />
              {:else}
                <input
                  class="input"
                  type="text"
                  placeholder={field.placeholder}
                  bind:value={data.configs[field.symbol]}
                />
              {/if}
            </div>
          </div>
        {/each}
      {/if}
    {/if}
    <div class="actions">
      <button
        class={"button is-primary " + (loading ? "is-loading" : "")}
        type="submit"
        disabled={(loading || !data.valid) && !(success || failed)}
        on:click={(e) => {
          if (success || failed) {
            e.preventDefault();
            success = false;
            failed = false;
            loading = false;
          }
        }}
      >
        {#if success || failed}
          Back
        {:else}
          Deploy
        {/if}
      </button>
    </div>
  </form>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
</style>
