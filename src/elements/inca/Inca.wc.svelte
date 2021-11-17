<svelte:options tag={null} />

<script lang="ts">
  import { Chart, registerables } from "chart.js";
  import { onMount } from "svelte";

  let canvas3D: HTMLCanvasElement;

  onMount(() => {
    Chart.register(...registerables);
  });
</script>

<div>
  <canvas bind:this={canvas3D} />
</div>
