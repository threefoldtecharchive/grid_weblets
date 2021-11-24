<svelte:options tag="tf-tabs" />

<script lang="ts">
  import type { ITab } from "../types";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ removed: number }>();

  export let tabs: ITab[];
  export let active: string;
  export let centered: boolean = true;

  const onRemove = (idx: number) => () => dispatch("removed", idx);
</script>

<div class={"tabs " + (centered ? "is-centered" : "")}>
  <ul>
    {#if tabs}
      {#each tabs as tab, index (tab.label)}
        <li class={active === tab.value ? "is-active" : ""}>
          <a href="#!" on:click|preventDefault={() => (active = tab.value)}>
            <span>{tab.label}</span>
            {#if tab.removable}
              <button
                class="ml-2 is-small delete"
                on:click|preventDefault|stopPropagation={onRemove(index)}
              />
            {/if}
          </a>
        </li>
      {/each}
    {/if}
  </ul>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
