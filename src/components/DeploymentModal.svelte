<svelte:options tag="tf-deployment-model" />

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ITab } from "../types";
  import copy from "../utils/copy";

  // components
  import Tabs from "./Tabs.svelte";

  const dispatch = createEventDispatcher<{ closed: void }>();
  const tabs: ITab[] = [
    { label: "Formatted", value: "formatted" },
    { label: "JSON", value: "json" },
  ];
  let active: string = "formatted";
  export let data: Object;
  $: json = data ? JSON.stringify(data, undefined, 4) : "";

  const style = `
<style>
  .modal-content {
    width: calc(100% - 30px);
    max-height: 70vh;
    transform: translateY(30px);
    background-color: white;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background-color: #d3d3d3;
  }
  
  .modal-content::-webkit-scrollbar {
    width: 10px;
  }

  .content {
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #fff;
  }

  .modal-content > div,
  .content {
    width: 100%;
  }

  .json {
    white-space: pre-wrap;
  }
</style>
`;
</script>

<div>
  {@html style}
</div>

<div class="modal is-active">
  <div class="modal-background" />
  <div class="modal-content">
    <div class="box">
      <Tabs bind:active {tabs} />

      <section class="content">
        {#if active === "formatted"}
          formatted
        {:else if active === "json"}
          <div class="json">
            {json}
          </div>
          <hr />
          <div class="is-flex is-justify-content-flex-end">
            <button class="button is-primary" on:click={() => copy(json)}>
              Copy
            </button>
          </div>
        {/if}
      </section>
    </div>
  </div>
  <button
    class="modal-close is-large"
    aria-label="close"
    on:click|preventDefault={() => dispatch("closed")}
  />
</div>
