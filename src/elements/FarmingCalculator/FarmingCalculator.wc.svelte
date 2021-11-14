<svelte:options tag={null} />

<script lang="ts">
  import FarmingProfile from "../../types/FarmingProfile";

  const profiles = [
    new FarmingProfile(),
    new FarmingProfile("Custom Profile", 32, 8, 10000, 1000, 0.06, 1, 16, 10, 0.2), // prettier-ignore
  ];
  let profileChoosing: boolean = false;
  let activeProfile: FarmingProfile = profiles[1];

  function onSelectProfile(e: Event) {
    const idx = e.target["selectedIndex"] - 1;
    activeProfile = profiles[idx];
  }

  // prettier-ignore
  const fields = [
    { label: "Memory (GB)", symbol: "memory" },
    { label: "CPU (Cores)", symbol: "cpu" },
    { label: "HDD (GB)", symbol: "hdd" },
    { label: "SSD (GB)", symbol: "ssd" },
    { label: "Price of TFT at point of registration on blockchain", symbol: "price" },
    { label: "Token price after 5 years", symbol: 'priceAfter5Years'},
    { label: "Reward Per CU", symbol: 'rewardPerCu'},
    { label: "Reward Per SU", symbol: 'rewardPerSu'},
    { label: "Reward Per NU", symbol: 'rewardPerNu'}
];
</script>

<section class="farming-container">
  <div class="box">
    <h4 class="is-size-4 mb-4">
      Farming Calculator
      {#if activeProfile && !profileChoosing}
        ({activeProfile.name})
      {/if}
    </h4>
    <hr />

    {#if profileChoosing}
      <div class="profile-container">
        <div>
          <p class="mb-2">Choose a profile</p>

          <div class="select">
            <select on:change={onSelectProfile}>
              <option disabled selected>Please Select A Profile</option>
              {#each profiles as profile (profile.name)}
                <option>
                  {profile.name}
                </option>
              {/each}
            </select>
          </div>

          <div class="mt-4">
            <button
              disabled={activeProfile === null}
              class="button is-primary"
              on:click={() => (profileChoosing = false)}
            >
              Choose
            </button>
          </div>
        </div>
      </div>
    {:else}
      <div class="farming-content">
        <div class="farming-content--left">
          {#each fields as field (field.symbol)}
            <div class="field">
              <div class="control">
                <label class="label">
                  <p>{field.label}</p>
                  <input
                    class="input"
                    type="number"
                    bind:value={activeProfile[field.symbol]}
                  />
                </label>
              </div>
            </div>
          {/each}
        </div>
        <div class="farming-content--right" style="white-space: pre;">
          {JSON.stringify(activeProfile, undefined, 4)}
        </div>
      </div>
    {/if}
  </div>
</section>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .farming-container {
    padding: 15px;
  }

  .profile-container {
    display: flex;
    justify-content: center;
  }

  .farming-content {
    display: flex;

    &--left {
      width: 70%;
      border-right: 2px solid #f5f5f5;
      padding-right: 1.5rem;
    }

    &--right {
      width: 30%;
      padding-left: 1.5rem;
    }
  }
</style>
