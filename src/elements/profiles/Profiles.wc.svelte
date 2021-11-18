<svelte:options tag={null} />

<script lang="ts">
  import type { IFormField } from "../../types";

  const configs = window.configs?.baseConfig;
  let activeConfig: number = 0;
  let password: string = "";

  // prettier-ignore
  const configFields: IFormField[] = [
    { label: "Mnemonics", symbol: "mnemonics", placeholder: "Mnemonics of your tfchain account" },
    { label: "Store Secret", symbol: "storeSecret", placeholder: "Secret key used as profile secret" },
  ];

  function onSelectProfile(idx: number) {
    activeConfig = idx;
  }

  $: profiles = $configs.profiles;
  $: activeProfile = $configs.profiles[activeConfig];
</script>

<section style="padding: 15px;">
  <div class="box">
    <div
      style="display: flex; justify-content: space-between; align-items: center;"
    >
      <h4 class="is-size-4">Profiles</h4>
      <button
        class="button is-primary is-small is-outlined"
        type="button"
        on:click={configs.addProfile}
      >
        + Add Profile
      </button>
    </div>
    <hr />

    <!--  -->

    <div class="tabs">
      <ul>
        {#each profiles as _, idx}
          <li class={activeConfig === idx ? "is-active" : ""}>
            <a
              href="#!"
              on:click|preventDefault={onSelectProfile.bind(undefined, idx)}
            >
              <span>Profile {idx + 1}</span>
              {#if idx !== 0}
                <button
                  class="ml-2 is-small delete"
                  on:click|preventDefault|stopPropagation={configs.deleteProfile.bind(
                    undefined,
                    idx
                  )}
                />
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </div>

    <div class="mt-2">
      <p class="label">Network Environment</p>
      <div
        class="select mb-2"
        style="display: flex; justify-content: flex-end;"
      >
        <select style="width: 100%;" bind:value={activeProfile.networkEnv}>
          <option value="test">Testnet</option>
          <option value="dev">Devnet</option>
        </select>
      </div>
      {#each configFields as field (field.symbol)}
        <div class="field">
          <p class="label">{field.label}</p>
          <div class="control">
            {#if field.type === "password"}
              <input
                class="input"
                type="password"
                autocomplete="off"
                placeholder={field.placeholder}
                bind:value={activeProfile[field.symbol]}
              />
            {:else}
              <input
                class="input"
                type="text"
                placeholder={field.placeholder}
                bind:value={activeProfile[field.symbol]}
              />
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <hr />

    <div style="display: flex; align-items: center; ">
      <div class="field" style="width: 100%;">
        <p class="label">Secret</p>
        <div class="control">
          <input
            class="input"
            type="password"
            autocomplete="off"
            placeholder="Secret key used for data encryption."
            bind:value={password}
          />
        </div>
      </div>

      <button
        class="button is-primary is-outlined mr-2 ml-2 mt-4"
        type="button"
        disabled={password === ""}
        on:click={configs.load.bind(undefined, password)}
      >
        Load
      </button>

      <button
        class="button is-primary mt-4"
        type="button"
        disabled={password === ""}
        on:click={configs.save.bind(undefined, password)}
      >
        Save
      </button>
    </div>
  </div>
</section>
