<svelte:options tag="tf-inca" />

<script lang="ts">
  // import { build3DChart } from "../../utils/incaCharts";
  // import Plotly from "plotly.js-dist";

  let canvas3D;

  /*onMount(() => {
    const { x, y, z } = build3DChart(canvas3D);

    Plotly.newPlot(
      canvas3D,
      [
        {
          type: "scatter3d",
          mode: "lines",
          x: x,
          y: y,
          z: z,
          opacity: 1,
          line: {
            width: 6,
            reversescale: false,
          },
        },
      ],
      {
        height: 500,
      }
    );
  });*/
</script>

<div style="width: 500px;">
  <div bind:this={canvas3D} />
</div>
