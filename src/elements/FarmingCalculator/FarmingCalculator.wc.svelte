<svelte:options tag={null} />

<script lang="ts">
  import FarmingProfile from "../../types/FarmingProfile";

  const profiles = [
    new FarmingProfile(),
    new FarmingProfile("Custom", 32, 8, 10000, 1000, 0.06, 1), // prettier-ignore
    new FarmingProfile("Standard", 32, 8, 10000, 1000, 0.06, 1), // prettier-ignore
  ];
  let profileChoosing: boolean = false;
  let activeProfile: FarmingProfile = profiles[2];

  function onSelectProfile(e: Event) {
    const idx = e.target["selectedIndex"] - 1;
    activeProfile = profiles[idx];
  }

  // prettier-ignore
  const inputFields = [
    { label: "Memory (GB)", symbol: "memory" },
    { label: "CPU (Cores)", symbol: "cpu" },
    { label: "HDD (GB)", symbol: "hdd" },
    { label: "SSD (GB)", symbol: "ssd" },
    { label: "Price of TFT at point of registration on blockchain (USD)", symbol: "price" },
    { label: "Token price after 5 years (USD)", symbol: "priceAfter5Years" },
    { label: "Public IP", symbol: "publicIp", type: "checkbox" },
    { label: "Certified", symbol: "certified", type: "checkbox" },
  ];

  // prettier-ignore
  const outputFields = [
    { label: "CU", symbol: "cu" },
    { label: "NU", symbol: "nu" },
    { label: "SU", symbol: "su" },
    { label: "Average Token Price", symbol: "averageTokenPrice" },
    { label: "Reward Per CU", symbol: "rewardPerCu" },
    { label: "Reward Per SU", symbol: "rewardPerSu" },
    { label: "Reward Per NU", symbol: "rewardPerNu" },
    { label: "TFT Reward Per CU", symbol: "tftRewardPerCu" },
    { label: "TFT Reward Per SU", symbol: "tftRewardPerSu" },
    { label: "TFT Reward Per NU", symbol: "tftRewardPerNu" },
    { label: "CU Farming Reward In TFT", symbol: "cuFarmingRewardInTft" },
    { label: "SU Farming Reward In TFT", symbol: "suFarmingRewardInTft" },
    { label: "NU Farming Reward In TFT", symbol: "nuFarmingRewardInTft" },
    { label: "Total Farming Reward In TFT", symbol: "totalFarmingRewardInTft" },
  ];
</script>

<section class="farming-container">
  <div class="box">
    <div
      style="display: flex; justify-content: space-between; align-items: center;"
    >
      <h4 class="is-size-4 mb-4">
        Farming Calculator
        {#if activeProfile && !profileChoosing}
          ({activeProfile.name} Configuration)
        {/if}
      </h4>
      {#if !profileChoosing}
        <button
          class="button is-primary is-outlined"
          on:click={() => (profileChoosing = true)}
        >
          Back
        </button>
      {/if}
    </div>
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
          {#each inputFields as field (field.symbol)}
            <div class="field">
              <div class="control">
                {#if field.type === "checkbox"}
                  <label class="checkbox">
                    <p class="label">{field.label}</p>
                    <input
                      type="checkbox"
                      bind:checked={activeProfile[field.symbol]}
                    />
                    {field.label}
                  </label>
                {:else}
                  <label class="label">
                    <p>{field.label}</p>
                    <input
                      class="input"
                      type="number"
                      bind:value={activeProfile[field.symbol]}
                    />
                  </label>
                {/if}
              </div>
            </div>
          {/each}
        </div>
        <div class="farming-content--right" style="white-space: pre;">
          <div>
            <br />
            <br />
            <br />
            <br />
            <br />

            test

            <br />
            <br />
            <br />
            <br />
          </div>
          {#each outputFields as field (field.symbol)}
            <div class="field">
              <div class="control">
                <label class="label">
                  <p>{field.label}</p>
                  <input
                    disabled
                    class="input"
                    type="number"
                    value={activeProfile[field.symbol].toFixed(2)}
                  />
                </label>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</section>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .farming-container {
    padding: 15px;
    max-height: 100vh;
  }

  .profile-container {
    display: flex;
    justify-content: center;
  }

  .farming-content {
    --w: 65%;
    display: flex;

    &--left {
      width: var(--w);
      border-right: 2px solid #f5f5f5;
      padding-right: 1.5rem;
    }

    &--right {
      width: calc(100% - var(--w));
      padding: 0 1.5rem;
    }

    &--left,
    &--right {
      max-height: calc(100vh - 175px);
      min-height: 100px;
      overflow-x: hidden;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 10px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #d3d3d3;
      }
    }
  }
</style>
