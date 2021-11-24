<svelte:options tag="tf-peertube" />

<script lang="ts">
  import VM, { Disk, Env } from "../../types/vm";
  import type { IFormField } from "../../types";
  const { events } = window.configs?.grid3_client ?? {};
  import deployPeertube from "../../utils/deployPeertube";
  const data = new VM();
  const tabs = [{ label: "Base" }, { label: "Configs" }];
  let active: string = "Base";
  let loading = false;
  let success = false;
  let failed = false;
  const configs = window.configs?.baseConfig;
  let profileIdx: number = 0;
  $: profiles = $configs;
  $: profile = $configs[profileIdx];
  // prettier-ignore
  const baseFields: IFormField[] = [
    { label: "Name", symbol: 'name', placeholder: 'Your VM name.'},
    { label: "Public IP", symbol: "publicIp", placeholder: "", type: 'checkbox' },
    { label: "Planetary", symbol: "planetary", placeholder: "", type: 'checkbox' },
    ];
  // prettier-ignore
  const configFields: IFormField[] = [
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Your Mnemonics." },
    { label: "Store Secret", symbol: "storeSecret", placeholder: "Your Store Secret." },
  ];
  let message: string;
  function onDeployVM() {
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
    deployPeertube(data, profile)
      .then(() => (success = true))
      .catch((err) => {
        failed = true;
        message = typeof err === "string" ? err : err.message;
      })
      .finally(() => {
        loading = false;
        events.removeListener("logs", onLogInfo);
      });
  }
  const onSelectProfile = (e: Event) => profileIdx = (e.target as any).selectedIndex; // prettier-ignore
</script>

<div style="padding: 15px;">
  <form on:submit|preventDefault={onDeployVM} class="box">
    <h4 class="is-size-4">Deploy a Peertube Instance</h4>
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
      <div class="notification is-success">&gt; Successfully deployed VM.</div>
    {:else if failed}
      <div class="notification is-danger">
        &gt;
        {#if message}
          {message}
        {:else}
          Failed to deploy VM.
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

      {#if active === "Base"}
        <!-- Show Base Info -->
        {#each baseFields as field (field.symbol)}
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
              {:else if field.type === "checkbox"}
                <label class="checkbox">
                  <input
                    type="checkbox"
                    checked={data[field.symbol]}
                    on:change={() => (data[field.symbol] = !data[field.symbol])}
                  />
                  {field.label}
                </label>
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
  .vm-container {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 70vh;
    will-change: transform;
    padding-bottom: 5rem;
    margin-bottom: 20px;
  }
  .vm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
