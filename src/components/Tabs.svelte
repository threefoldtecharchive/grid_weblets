<svelte:options tag="tf-tabs" />

<script lang="ts">
  import type { ITab } from "../types";
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch =
    createEventDispatcher<{ removed: number; select: string; init: void }>();

  export let tabs: ITab[];
  export let active: string;
  export let centered: boolean = true;
  export let disabled: boolean = false;
  export let opened: boolean = false;
  export let selectedTab: string;
  export let selectedID: number;

  const onRemove = (idx: number) => () => {
    dispatch("removed", idx);
    opened = !opened;
  };
  function onSelectTab(tab: string) {
    if (active !== tab) {
      active = tab;
      dispatch("select", tab);
    }
  }

  onMount(() => {
    dispatch("init");
  });
</script>

<div class={"tabs " + (centered ? "is-centered" : "")}>
  <ul style={disabled ? "pointer-events: none; cursor: default;" : ""}>
    {#if tabs}
      {#each tabs as tab, index (tab.label)}
        <li class={active === tab.value ? "is-active" : ""}>
          <a
            href="#!"
            on:click|preventDefault={onSelectTab.bind(undefined, tab.value)}
          >
            <span>{tab.label}</span>
            {#if tab.removable}
              <button
                class="ml-2 is-small delete"
                on:click|preventDefault|stopPropagation={() => {
                  opened = !opened;
                  selectedID = index;
                  selectedTab = tab.label;
                }}
              />
            {/if}
          </a>
        </li>
      {/each}
    {/if}
  </ul>
</div>
<div class={"modal" + (opened ? " is-active" : "")}>
  <div class="modal-background" />
  <div class="modal-card">
    <section class="modal-card-body">
      Delete {selectedTab}?
      <div style="float: right; margin-top: 50px;">
        <button
          class="button is-danger"
          style="background-color: #FF5151; color: #fff"
          on:click|preventDefault|stopPropagation={onRemove(selectedID)}
          >Delete</button
        >
        <button
          class="button"
          on:click|stopPropagation={() => (opened = !opened)}>Cancel</button
        >
      </div>
    </section>
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
