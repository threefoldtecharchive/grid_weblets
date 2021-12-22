<svelte:options tag="tf-inca" />

<script lang="ts">
  import { onMount } from "svelte";
  import { build3DChart } from "../../utils/incaCharts";
  import Plotly from "plotly.js-dist";
  
  // Components
  import Input from "../../components/Input.svelte";
  import type { IFormField } from "../../types";
  let baseFields: IFormField[] = [
    { label: "Investment", symbol: 'investment', placeholder: 'Initial Investment (in million USD)', type: 'number' },
    { label: "TFS Price", symbol: 'notfs', placeholder: 'TFS in USD', type: 'number' },
    { label: "Tech Marketcap", symbol: "techmarket", placeholder: "(in million USD)", type: 'number' },
    { label: "TFT Price 5Y", symbol: "tftprice", placeholder: "", type: 'checkbox' },
  ];
  let canvas3D;
  let inputData = {
    notfs: 5000000, 
    investment: 50, 
    techmarket: 5000, 
    tftprice: 4
  }
  const layout = {
      title: "INCA",
      autosize: false,
      width: 825,
      height: 750,
      margin: {
        l: 160,
        r: 50,
        b: 65,
        t: 50,
      },
      scene: {
        xaxis: {
          title: "Tech Marketcap",
        },
        yaxis: {
          title: "TFT Price (in USD)",
        },
        zaxis: {
          title: "Multiple",
        },
      },
    };
    const options = {
      displayModeBar: false,
    };
    function calcData() {
      const { notfs, investment, techmarket, tftprice } = inputData;
      const { x, y, z } = build3DChart(notfs, investment, techmarket, tftprice);
      let resx = x.map((e, i) => [e, y[i], z[i]]);
      type IRes = Array<number[]>;
      const res: IRes = [
        // [0, ...x]
      ];
      for (let i = 0; i < y.length; i++) {
        const row = Array.from({ length: y.length + 1 }).fill(0) as number[];
        // row[0] = z[i];
        row[i] = z[i];
        res.push(row);
      }
      return [
        {
          x: x,
          y: y,
          z: res,
          type: "surface",
          hovertemplate:
            "<extra><br>Tech Marketcap (in millions)</br>: $%{x}</extra>" +
            "<extra><br>TFT Price (in USD)</br>: $%{y}</extra>" +
            "<extra><br>Multiple</br>:%{z}</extra>",
          showscale: false,
        },
      ];
    }
  onMount(() => {
    Plotly.newPlot(canvas3D, calcData(), layout, options);
  });
  $: {
    Plotly.update(canvas3D, calcData(), layout, options);
  }
</script>

<div style="padding: 15px;">
  <h4 class="is-size-4">Calculate your ROI</h4>
  <hr />
  {#each baseFields as field (field.symbol)}
    <Input bind:data={inputData[field.symbol]} {field}/>  
  {/each}
  <div bind:this={canvas3D} />
</div>