<svelte:options tag={null} />

<script lang="ts">
  const configs = window.configs?.baseConfig;
  let activeConfig: number = 0;
  let password: string = "";

  function onSelectProfile(idx: number) {
    activeConfig = idx;
  }

  $: profiles = $configs;
  $: activeProfile = $configs[activeConfig];
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
        {#each profiles as profile, idx}
          <li class={activeConfig === idx ? "is-active" : ""}>
            <a
              href="#!"
              on:click|preventDefault={onSelectProfile.bind(undefined, idx)}
            >
              <span>
                {#if profile.name}
                  {profile.name}
                {:else}
                  Profile {idx + 1}
                {/if}
              </span>
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
      <div class="field">
        <p class="label">Name</p>
        <div class="control">
          <input
            class="input"
            type="text"
            value={activeProfile.name}
            on:input={configs.updateName.bind(undefined, activeConfig)}
            placeholder="Enter Your Mnemonics"
          />
        </div>
      </div>

      <p class="label">Network Environment</p>
      <div
        class="select mb-2"
        style="display: flex; justify-content: flex-end;"
      >
        <select
          style="width: 100%;"
          value={activeProfile.networkEnv}
          on:change={configs.updateNetworkEnv.bind(undefined, activeConfig)}
        >
          <option value="test">Testnet</option>
          <option value="dev">Devnet</option>
        </select>
      </div>

      <div class="field">
        <p class="label">Mnemonics</p>
        <div class="control">
          <input
            class="input"
            type="text"
            value={activeProfile.mnemonics}
            on:input={configs.updateMnemonics.bind(undefined, activeConfig)}
            placeholder="Enter Your Mnemonics"
          />
        </div>
      </div>
      <div class="field">
        <p class="label">Store Secret</p>
        <div class="control">
          <input
            class="input"
            type="password"
            autocomplete="off"
            value={activeProfile.storeSecret}
            on:input={configs.updateStoreSecret.bind(undefined, activeConfig)}
            placeholder="Secret key used as profile secret"
          />
        </div>
      </div>
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

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
