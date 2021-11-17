<svelte:options tag={null} />

<script lang="ts">
  import FarmingProfile from "../../types/FarmingProfile";
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";
  import {
    buildPieChart,
    buildLineChart,
  } from "../../utils/FarmingCalculatorCharts";

  const profiles = [
    new FarmingProfile(),
    new FarmingProfile("Titan v2.1", 32, 8, 10000, 1000, 0.06, 1), // prettier-ignore
  ];
  let profileChoosing: boolean = true;
  let activeProfile: FarmingProfile = null;

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
    { label: "Power Utilization", symbol: "powerUtilization" },
    { label: "Power Cost", symbol: "powerCost" },
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

  let pieCanvas: HTMLCanvasElement;
  let _pieChart: Chart<"doughnut", number[], string>;

  let lineCanvas: HTMLCanvasElement;
  let _lineCanvas: Chart<"line", number[], string>;

  onMount(() => {
    Chart.register(...registerables);
  });

  function onProfileChoosing() {
    profileChoosing = false;
    requestAnimationFrame(() => {
      _pieChart = buildPieChart(pieCanvas);
      _lineCanvas = buildLineChart(lineCanvas, activeProfile);
    });
  }

  function onBackProfileChoosing() {
    profileChoosing = true;
    _pieChart = null;
    _lineCanvas = null;
  }

  $: {
    if (_pieChart && activeProfile) {
      const { cu, su, nu, rewardPerCu, rewardPerNu, rewardPerSu } = activeProfile; // prettier-ignore
      _pieChart.data.datasets[0].data = [cu * rewardPerCu, su * rewardPerSu, nu * rewardPerNu]; // prettier-ignore
      _pieChart.update();
    }

    if (_lineCanvas && activeProfile) {
      const xs = [...Array.from({ length: 51 }).map((_, i) => 0.15 + 0.397 * i)]; // prettier-ignore
      _lineCanvas.data.datasets[0].data = xs.map((x) => activeProfile.getTotalReward(x)); // prettier-ignore
      _lineCanvas.update();
    }
  }
</script>

<section class="farming-container">
  <div class="box">
    <div
      style="display: flex; justify-content: space-between; align-items: center;"
    >
      <h4 class="is-size-4 mb-4">
        Farming Calculator
        {#if activeProfile && !profileChoosing}
          ({activeProfile.name})
        {/if}
      </h4>
      {#if !profileChoosing}
        <button
          class="button is-primary is-outlined"
          on:click={onBackProfileChoosing}
        >
          Back
        </button>
      {/if}
    </div>
    <hr />

    {#if profileChoosing}
      <div class="profile-container">
        <div>
          <p class="mb-2">Choose configuration</p>

          <div class="select">
            <select on:change={onSelectProfile}>
              <option disabled selected>Please select configuration</option>
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
              on:click={onProfileChoosing}
            >
              Select Configuration
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
        <div class="farming-content--right">
          <div class="charts-container">
            <div class="chart chart-1">
              <canvas bind:this={pieCanvas} />
            </div>
            <div class="chart">
              <canvas bind:this={lineCanvas} />
            </div>
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
    --w: 35%;
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

  .charts-container {
    display: flex;
    align-items: center;
  }

  .chart {
    width: 60%;

    &-1 {
      width: 40%;
      border-right: 2px solid #f5f5f5;
      margin-right: 1.5rem;
    }
  }
</style>
