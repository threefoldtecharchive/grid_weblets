<svelte:options tag="tf-farming-calculator" />

<script lang="ts">
  import FarmingProfile, {
    Certification,
    ProfileTypes,
  } from "../../types/FarmingProfile";
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";
  import {
    buildPieChart,
    buildLineChart,
  } from "../../utils/FarmingCalculatorCharts";

  // Components
  import Input from "../../components/Input.svelte";
  import type { IFormField } from "../../types";

  const profiles = [
    new FarmingProfile({
      type: ProfileTypes.DIY,
      name: "DIY",
      memory: 32,
      cpu: 8,
      hdd: 10000,
      ssd: 1000,
      price: 0.08,
      priceAfter5Years: 1,
    }),
    new FarmingProfile({
      type: ProfileTypes.TITAN,
      name: "Titan v2.1",
      memory: 32,
      cpu: 8,
      hdd: 0,
      ssd: 1000,
      price: 0.08,
      priceAfter5Years: 1,
      investmentCostHW: 800,
    }),
  ];

  let profileChoosing: boolean = true;
  let activeProfile: FarmingProfile = null;

  function onSelectProfile(e: Event) {
    activeProfile = profiles[e.target["selectedIndex"] - 1];
  }

  const tabFields = ["Basic", "Advanced"];
  let active: string = tabFields[0];

  // prettier-ignore
  const inputFields = [
    { label: "Memory (GB)", symbol: "memory" },
    { label: "vCPU (Threads)", symbol: "cpu" },
    { label: "HDD (GB)", symbol: "hdd", only: "DIY" },
    { label: "SSD (GB)", symbol: "ssd" },
    { label: "NU Required Per CU", symbol: "nuRequiredPerCu" },
    { label: "Hardware Cost (USD)", symbol: "investmentCostHW" },
    { label: "Price of TFT at point of registration on blockchain (USD)", symbol: "price" },
    // { label: "Token price after 5 years (USD)", symbol: "priceAfter5Years" },
    { label: "Power Utilization (Watt)", symbol: "powerUtilization" },
    { label: "Power Cost (USD)", symbol: "powerCost" },
    { label: "Public IP", symbol: "publicIp", type: "checkbox" },
    { label: "Certified", symbol: "certified", type: "checkbox" },
  ];

  // prettier-ignore
  const basicInputFields = [
    { label: "Memory (GB)", symbol: "memory" },
    { label: "vCPU (Threads)", symbol: "cpu" },
    { label: "HDD (GB)", symbol: "hdd", only: "DIY" },
    { label: "SSD (GB)", symbol: "ssd" },
    { label: "NU Required Per CU", symbol: "nuRequiredPerCu" },
    { label: "Hardware Cost (USD)", symbol: "investmentCostHW" },
    { label: "Price of TFT at point of registration on blockchain (USD)", symbol: "price" },
    { label: "Maximum Token Price", symbol: "maximumTokenPrice" },
    { label: "Power Utilization (Watt)", symbol: "powerUtilization" },
    { label: "Power Cost (USD)", symbol: "powerCost" },
    { label: "Public IP", symbol: "publicIp", type: "checkbox" },
    { label: "Certified", symbol: "certified", type: "checkbox" },
  ];

  // prettier-ignore
  const outputFields = [
    { label: "Total Monthly Farming Reward In TFT", symbol: "totalFarmingRewardInTft", fullWidth: true },
    { label: "CU", symbol: "cu" },
    { label: "SU", symbol: "su" },
    { label: "NU", symbol: "nu" },
    // { label: "Average Token Price", symbol: "averageTokenPrice" },
    { label: "USD reward per CU", symbol: "rewardPerCu" },
    { label: "USD reward per SU", symbol: "rewardPerSu" },
    { label: "USD reward per NU", symbol: "rewardPerNu" },
    { label: "TFT Reward Per CU", symbol: "tftRewardPerCu" },
    { label: "TFT Reward Per SU", symbol: "tftRewardPerSu" },
    { label: "TFT Reward Per NU", symbol: "tftRewardPerNu" },
    { label: "CU Farming Reward In TFT", symbol: "cuFarmingRewardInTft" },
    { label: "SU Farming Reward In TFT", symbol: "suFarmingRewardInTft" },
    { label: "NU Farming Reward In TFT", symbol: "nuFarmingRewardInTft" },
  ];

  // prettier-ignore
  const basicOutputFields = [
    { label: "CU", symbol: "cu" },
    { label: "SU", symbol: "su" },
    { label: "NU", symbol: "nu" },
    { label: "USD reward per CU", symbol: "rewardPerCu" },
    { label: "USD reward per SU", symbol: "rewardPerSu" },
    { label: "USD reward per NU", symbol: "rewardPerNu" },
  ];

  // prettier-ignore
  const advancedFields = [
    { label: "Return On Investment", symbol: "ROI", skip: true, big: true },
    { label: "Net Profit", symbol: "netProfit", big: true },
    { label: "Gross Profit", symbol: "grossProfit" },
    { label: "Total Costs", symbol: "totalCosts" },
  ];

  let pieCanvas: HTMLCanvasElement;
  let _pieChart: Chart<"doughnut", number[], string>;

  let lineCanvas: HTMLCanvasElement;
  let _lineCanvas: Chart<"line", number[], string>;

  onMount(() => {
    Chart.register(...registerables);
  });

  function _initCharts() {
    requestAnimationFrame(() => {
      if (pieCanvas) _pieChart = buildPieChart(pieCanvas); // prettier-ignore
      if (lineCanvas) _lineCanvas = buildLineChart(lineCanvas, activeProfile); // prettier-ignore
    });
  }

  function onProfileChoosing() {
    profileChoosing = false;
    _initCharts();
  }

  function onBackProfileChoosing() {
    profileChoosing = true;
    activeProfile = null;
    _pieChart = null;
    _lineCanvas = null;
  }

  function onSelectTab(tab: string) {
    _pieChart = null;
    _lineCanvas = null;
    active = tab;

    _initCharts();
  }

  let showChartRoi: boolean = false;
  function _updateLineCanvas() {
    const price = active === "Basic" ? activeProfile.maximumTokenPrice : activeProfile.priceAfter5Years; // prettier-ignore
    if (_lineCanvas && activeProfile) {
      const X = (price - 0.15) / 19;
      const xs = [...Array.from({ length: 20 }).map((_, i) => 0.15 + X * i)];
      _lineCanvas.data.labels = xs.map((i) => i.toFixed(2));

      if (showChartRoi) {
        _lineCanvas.data.datasets[0].label = "ROI";
        _lineCanvas.options.plugins.title.text = "Return On Investment / TFT Price(USD)"; // prettier-ignore
        _lineCanvas.data.datasets[0].data = xs.map((x) => activeProfile.getRoi(x) / 100); // prettier-ignore
      } else {
        _lineCanvas.data.datasets[0].label = "Margin";
        _lineCanvas.options.plugins.title.text = "Return (USD) / TFT price (USD)"; // prettier-ignore
        _lineCanvas.data.datasets[0].data = xs.map((x) => activeProfile.getTotalReward(x)); // prettier-ignore
      }
      _lineCanvas.update();
    }
  }

  $: {
    if (_pieChart && activeProfile) {
      const { /* cu, su, rewardPerCu, rewardPerSu, */ nuFarmingRewardInTft, cuFarmingRewardInTft, suFarmingRewardInTft } = activeProfile; // prettier-ignore
      // _pieChart.data.datasets[0].data = [cu * rewardPerCu, su * rewardPerSu, nuFarmingRewardInTft]; // prettier-ignore
      _pieChart.data.datasets[0].data = [cuFarmingRewardInTft, suFarmingRewardInTft, nuFarmingRewardInTft]; // prettier-ignore
      _pieChart.update();
    }

    if (_lineCanvas && activeProfile) {
      _updateLineCanvas(); // prettier-ignore
    }
  }

  // prettier-ignore
  const createNumberField = ({ label, symbol }: any): IFormField => ({ 
    label, 
    symbol, 
    type: "number", 
    min: 0,
    validator(val: number) {
      val = +val;
      if (isNaN(val)) return "Invalid Number";
      if (val < 0) return "Value must be positive";
    }  
  });

  const certifications = [
    { id: "nc", name: "No Certification", value: Certification.NONE },
    { id: "cn", name: "Certified Node", value: Certification.CERTIFIED },
  ];

  const titanCertification = [
    ...certifications,
    {
      id: "gc",
      name: "Node Belongs To Gold Certified Farm",
      value: Certification.GOLD_CERTIFIED,
    },
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
          ({activeProfile.name})
        {/if}
      </h4>
      {#if !profileChoosing}
        <button
          class="button is-outlined"
          style={`border-color: #1982b1; color: #1982b1`}
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
          <p class="mb-2">Choose Configuration</p>

          <div class="select">
            <select on:change={onSelectProfile}>
              <option disabled selected>Please Select Configuration</option>
              {#each profiles as profile (profile.name)}
                <option>
                  {profile.name}
                </option>
              {/each}
            </select>
          </div>
        </div>

        <div class="mt-4">
          <button
            disabled={activeProfile === null}
            class="button"
            style={`background-color: #1982b1; color: #fff`}
            on:click={onProfileChoosing}
          >
            Select Configuration
          </button>
        </div>
      </div>
    {/if}

    {#if !profileChoosing}
      <div class="tabs is-centered">
        <ul>
          {#each tabFields as tab (tab)}
            <li class={tab === active ? "is-active" : ""}>
              <a
                on:click|preventDefault={onSelectTab.bind(undefined, tab)}
                href="#!"
                >{tab}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      {#if active === "Basic"}
        <div class="farming-content">
          <div class="farming-content--left">
            {#each basicInputFields as field (field.symbol)}
              {#if !field.only || field.only === activeProfile.name}
                <div class="field">
                  <div class="control">
                    {#if field.symbol === "certified"}
                      <div>
                        <p class="label">{field.label}</p>
                        {#each activeProfile.type === ProfileTypes.DIY ? certifications : titanCertification as cert}
                          <label style="display: block;">
                            <input
                              type="radio"
                              name="cert"
                              value={cert.value}
                              bind:group={activeProfile[field.symbol]}
                            />
                            {cert.name}
                          </label>
                        {/each}
                      </div>
                    {:else if field.type === "checkbox"}
                      <label class="checkbox">
                        <p class="label">{field.label}</p>
                        <input
                          type="checkbox"
                          bind:checked={activeProfile[field.symbol]}
                        />
                        {field.label}
                      </label>
                    {:else}
                      <Input
                        bind:data={activeProfile[field.symbol]}
                        field={createNumberField(field)}
                      />
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
          <div class="farming-content--right">
            <div class="charts-container">
              <div class="chart chart-1" style="display: none;">
                <canvas bind:this={pieCanvas} />
              </div>
              <div class="chart chart-2">
                <div style="display: flex; align-items: center;">
                  <label
                    for="roi-checkbox"
                    class="label mr-2 mb-0"
                    style="cursor: pointer;"
                  >
                    Net Profit
                  </label>
                  <label class="switch">
                    <input
                      type="checkbox"
                      checked={showChartRoi}
                      id="roi-checkbox"
                      on:change={() => {
                        showChartRoi = !showChartRoi;
                        _updateLineCanvas();
                      }}
                    />
                    <span class="slider" />
                  </label>
                  <label
                    for="roi-checkbox"
                    class="label ml-2"
                    style="cursor: pointer;"
                  >
                    Return On Investment
                  </label>
                </div>
                <canvas bind:this={lineCanvas} />
              </div>
            </div>
            <div class="calculations calculations-3 mt-4">
              {#each basicOutputFields as field (field.symbol)}
                <div class="field">
                  <div class="control">
                    <label class="label">
                      <p>{field.label}</p>
                      <input
                        disabled
                        class="input"
                        type="text"
                        value={activeProfile[field.symbol].toFixed(2)}
                      />
                    </label>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      {#if active === "Advanced"}
        <div class="farming-content">
          <div class="farming-content--left">
            {#each inputFields as field (field.symbol)}
              {#if !field.only || field.only === activeProfile.name}
                <div class="field">
                  <div class="control">
                    {#if field.symbol === "certified"}
                      <div>
                        <p class="label">{field.label}</p>
                        {#each activeProfile.type === ProfileTypes.DIY ? certifications : titanCertification as cert}
                          <label style="display: block;">
                            <input
                              type="radio"
                              name="cert"
                              value={cert.value}
                              bind:group={activeProfile[field.symbol]}
                            />
                            {cert.name}
                          </label>
                        {/each}
                      </div>
                    {:else if field.type === "checkbox"}
                      <label class="checkbox">
                        <p class="label">{field.label}</p>
                        <input
                          type="checkbox"
                          bind:checked={activeProfile[field.symbol]}
                        />
                        {field.label}
                      </label>
                    {:else}
                      <Input
                        bind:data={activeProfile[field.symbol]}
                        field={createNumberField(field)}
                      />
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
          <div class="farming-content--right">
            <div class="charts-container">
              <div class="chart chart-1">
                <canvas bind:this={pieCanvas} />
              </div>
              <div class="chart">
                <div class="field">
                  <div class="control">
                    <Input
                      bind:data={activeProfile.priceAfter5Years}
                      field={createNumberField({
                        label: "Token price after 5 years (USD)",
                        symbol: "priceAfter5Years",
                      })}
                    />
                  </div>
                </div>
                <hr />
                {#each advancedFields as field (field.symbol)}
                  <div class="field">
                    <div class="control">
                      <label class="label">
                        <p
                          style={field.big
                            ? "font-size: 20px; font-weight: bold;"
                            : ""}
                        >
                          {field.label}
                        </p>
                        <input
                          style={field.big
                            ? "font-size: 20px; font-weight: bold;"
                            : ""}
                          disabled
                          class="input"
                          type="text"
                          value={field.skip
                            ? activeProfile[field.symbol]
                            : activeProfile[field.symbol].toFixed(2)}
                        />
                      </label>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
            <div class="calculations calculations-3 mt-4">
              {#each outputFields as field (field.symbol)}
                <div class="field" style={field.fullWidth ? "width: 100%" : ""}>
                  <div class="control">
                    <label class="label">
                      <p>{field.label}</p>
                      <input
                        disabled
                        class="input"
                        type="text"
                        value={activeProfile[field.symbol].toFixed(2)}
                      />
                    </label>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    {/if}
    <hr />
    <p class="is-size-4 has-text-weight-bold">Disclaimer</p>
    <p>
      Simulations are NOT investment advice nor should they be looked at in this
      way. The scenarios shown are by no means a guarantee and no one can
      predict the future of yields exactly as they are heavily dependent on
      factors beyond anyone’s control. The <strong>DAO</strong> could also
      decide to change parameters or farming, which could have a different
      result. We invite the community to review and give feedback and make
      proposals for necessary changes
      <a
        href="https://forum.threefold.io/t/the-new-farming-calculator-a-much-simpler-way-to-calculate-your-potential-farming-rewards/1773/4"
        target="_blank"
      >
        here
      </a>
    </p>
  </div>
</section>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .farming-container {
    padding: 15px;

    > .box {
      min-height: 100px;
      max-height: 100vh;
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

  .profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
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

    &-2 {
      width: 100%;
    }
  }

  .calculations {
    display: flex;
    flex-wrap: wrap;

    > div {
      width: calc(100% / 4);
      padding: 0 10px;
    }

    &-3 > div {
      width: calc(100% / 3);
    }
  }

  /* Switch */
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: 0.4s;
      transition: 0.4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: 0.4s;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #1982b1;
    }

    input:checked + .slider {
      box-shadow: 0 0 1px #1982b1;
    }

    input:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }
  }
</style>
