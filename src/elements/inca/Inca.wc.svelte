<svelte:options tag={null} />

<script lang="ts">
  import { onMount } from "svelte";
  import { build3DChart } from "../../utils/incaCharts";

  let canvas3D: HTMLDivElement;

  onMount(() => {
    build3DChart(canvas3D);
  });
</script>

<div style="width: 500px;">
  <div bind:this={canvas3D} />
</div>
