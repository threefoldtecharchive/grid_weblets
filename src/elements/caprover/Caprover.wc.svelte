<svelte:options tag="tf-caprover" />

<script lang="ts">
  import type { IFormField } from "../../types";
  import { default as Caprover } from "../../types/caprover";
  import deployCaprover from "../../utils/deployCaprover";
  const { events } = window.configs?.grid3_client ?? {};

  const data = new Caprover();
  let loading = false;
  let success = false;
  let failed = false;
  const configs = window.configs?.baseConfig;
  const deploymentStore = window.configs?.deploymentStore;
  let profileIdx: number = 0;

  $: profiles = $configs;
  $: profile = $configs[profileIdx];
  requestAnimationFrame(() => {
    data.publicKey = profile?.sshKey;
  });

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
    { label: "Disk Size", symbol: "diskSize", placeholder: "Disk size in GB", type: "number" },
    { label: "Domain", symbol: "domain", placeholder: "domain configured on your name provider" },
    { label: "Public Key", symbol: "publicKey", placeholder: "Your Public Key" },
    { label: "Node ID", symbol: "nodeId", placeholder: "Node Id", type: "number", link:{ label: "Grid Explorer", url: "https://library.threefold.me/info/threefold#/manual_tfgrid3/threefold__grid3_explorer"}},

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
      .then(() => {
        deploymentStore.set(0);
        success = true;
      })
      .catch((err: string) => {
        failed = true;
        message = err;
      })
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
  }

  const onSelectProfile = (e: Event) => profileIdx = (e.target as any).selectedIndex; // prettier-ignore
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
          !profile ||
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
