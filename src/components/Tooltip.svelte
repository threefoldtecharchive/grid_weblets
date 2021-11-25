<svelte:options tag="tf-tooltip" />

<script lang="ts">
  export let tooltip: string = null;

  const style = `
<style>
  .tooltip {
    position: relative;
  }

  .tooltip__text {
    position: absolute;
    top: -20px;
    left: 50%;
    padding: 10px 15px;
    border-radius: 5px;
    background-color: rgba(51, 51, 51, 0.9);
    color: white;
    z-index: 9;
    max-width: min(1000px, calc(100% - 30px));
    display: block;

    transition-property: opacity, transform, visibility;
    transition-timing-function: ease;
    transition-duration: 300ms;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transform: translateX(-50%) translateY(20px) scale(0);
  }

  .tooltip:hover > .tooltip__text {
    pointer-events: all;
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0) scale(1);
  }
</style>
`;
</script>

<div>
  {@html style}
</div>

<div class="tooltip mb-2">
  <slot />
  {#if tooltip}
    <span class="tooltip__text">
      {tooltip}
    </span>
  {/if}
</div>
