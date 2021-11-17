<script lang="ts">
  import type { Colors } from "../../types";
  import ifTrue from "../../utils/ifTrue";
  import resolveColor from "../../utils/resolveColor";

  export let color: Colors = null;
  export let light: boolean = false;
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let outlined: boolean = false;
  export let preicon: string = "";
  export let suficon: string = "";
</script>

<button
  class={`
    button 
    ${resolveColor(color)} 
    ${ifTrue(light, "is-light")} 
    ${ifTrue(loading, "is-loading")} 
    ${ifTrue(outlined, "is-outlined")}
  `}
  {disabled}
>
  {#if preicon}
    <span class="icon">
      <i class={preicon} />
    </span>
  {/if}
  <span>
    <slot />
  </span>
  {#if suficon}
    <span class="icon">
      <i class={suficon} />
    </span>
  {/if}
</button>

<style scoped lang="scss">
  @import "bulma/sass/utilities/_all.sass";
  @import "bulma/sass/elements/button.sass";
</style>
