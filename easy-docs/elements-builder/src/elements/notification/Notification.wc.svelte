<svelte:options tag={null} />

<script lang="ts">
  import type { Colors } from "../../types";
  import resolveColor from "../../utils/resolveColor";

  export let color: Colors = null;
  export let light: boolean = false;
  export let deletable: boolean = false;

  let deleted = false;
</script>

{#if !deleted}
  <div class={`notification ${resolveColor(color)} ${light ? "is-light" : ""}`}>
    {#if deletable}
      <button class="delete" on:click={() => (deleted = true)} />
    {/if}
    <slot />
  </div>
{/if}

<style lang="scss" scoped>
  @import url("/assets/bulma.min.css");
</style>
