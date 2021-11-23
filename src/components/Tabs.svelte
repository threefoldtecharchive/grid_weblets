<svelte:options tag="tf-tabs" />

<script lang="ts">
  import type { ITab } from "../types";

  export let tabs: ITab[];
  export let active: string;
  export let centered: boolean = true;
</script>

<div class={"tabs " + (centered ? "is-centered" : "")}>
  <ul>
    {#if tabs}
      {#each tabs as tab (tab.label)}
        <li class={active === tab.value ? "is-active" : ""}>
          <a href="#!" on:click|preventDefault={() => (active = tab.value)}>
            <span>{tab.label}</span>
          </a>
        </li>
      {/each}
    {/if}
  </ul>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
