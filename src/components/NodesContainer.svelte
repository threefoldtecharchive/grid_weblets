<svelte:options tag="tf-nodes-container" />

<script lang="ts">
  import type { IFormField } from "../types";
  import Inputs from "./Inputs.svelte";

  export let nodes: any[];
  export let fields: IFormField[];
</script>

<div class="is-flex is-justify-content-flex-end is-align-items-center">
  <button type="button" class="button is-primary" on:click>
    <span>+</span>
  </button>
</div>
<div class="worker-container">
  {#if nodes}
    {#each nodes as node, index (node.id)}
      <div class="box">
        <div
          class="is-flex is-justify-content-space-between is-align-items-center"
        >
          <p class="is-size-5 has-text-weight-bold">{node.name}</p>
          <button
            type="button"
            class="button is-danger"
            on:click={() => (nodes = nodes.filter((_, i) => index !== i))}
          >
            <span>-</span>
          </button>
        </div>

        <Inputs bind:data={node} {fields} />
      </div>
    {/each}
  {/if}
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .worker-container {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 70vh;
    will-change: transform;
    padding-bottom: 5rem;
    margin-bottom: 20px;
  }
</style>
