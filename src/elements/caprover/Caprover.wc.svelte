<svelte:options tag={null} />

<script lang="ts">
  import SelectProfile from "../../components/SelectProfile.svelte";
  import type { IFormField } from "../../types";
  import { default as Caprover } from "../../types/caprover";
  import type { IProfile } from "../../types/Profile";
  import deployCaprover from "../../utils/deployCaprover";
  const { events } = window.configs?.grid3_client ?? {};

  const data = new Caprover();
  let loading = false;
  let success = false;
  let failed = false;
  let profile: IProfile;

  // prettier-ignore
  const tabs = [
    { label: "Config" },
  ];
  let active = "Config";

  // prettier-ignore
  const fields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Your caprover name" },
    { label: "CPU", symbol: "cpu", placeholder: "CPU", type: "number" },
    { label: "Memory", symbol: 'memory', placeholder: "Memory in MB", type: "number" },
    { label: "Node ID", symbol: "nodeId", placeholder: "Node Id", type: "number", link:{ label: "Grid Explorer", url: "https://explorer.tfchain.dev.threefold.io/nodes"}},
    { label: "Disk Size", symbol: "diskSize", placeholder: "Disk size in GB", type: "number" },
    { label: "Domain", symbol: "domain", placeholder: "domain configured on your name provider" },
    { label: "Public Key", symbol: "publicKey", placeholder: "Your Public Key" }
  ];

  let message: string;
  function deployCaproverHandler() {
    loading = true;
    success = false;
    failed = false;
    message = undefined;

    function onLogInfo(msg: string) {
      if (typeof msg === "string") {
        message = msg;
      }
    }

    events.addListener("logs", onLogInfo);

    deployCaprover(data, profile)
      .then(() => (success = true))
      .catch((err: string) => {
        failed = true;
        message = err;
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
      <div class="notification is-danger">
        &gt;
        {#if message}
          {message}
        {:else}
          Failed to deploy Caprover.
        {/if}
      </div>
    {:else}
      <SelectProfile on:profile={(p) => (profile = p.detail)} />
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

      {#if active === "Config"}
        {#each fields as field (field.symbol)}
          <div class="field">
            <p class="label">
              {field.label}
              {#if field.link}
                (<a href={field.link.url} target="_blank">{field.link.label}</a
                >)
              {/if}
            </p>
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
    {/if}
    <div class="actions">
      <button
        class={"button is-primary " + (loading ? "is-loading" : "")}
        type="submit"
        disabled={((loading || !data.valid) && !(success || failed)) ||
          profile.mnemonics === "" ||
          profile.storeSecret === ""}
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
