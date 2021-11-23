<svelte:options tag="tf-nodes-container" />

<script lang="ts">
  import type { IFormField } from "../types";
  import Inputs from "./Inputs.svelte";

  export let nodes: any[];
  export let fields: IFormField[];
</script>

<div class="actions">
  <button type="button" class="button is-primary" on:click>
    <span>+</span>
  </button>
</div>
<div class="worker-container">
  {#if nodes}
    {#each nodes as node, index (node.id)}
      <div class="box">
        <div class="worker-header">
          <p class="is-size-5 has-text-weight-bold">{node.name}</p>
          <button
            type="button"
            class="button is-danger"
            on:click={() => (nodes = nodes.filter((_, i) => index !== i))}
          >
            <span>-</span>
          </button>
        </div>

        <Inputs bind:data={nodes} {fields} />
      </div>
    {/each}
  {/if}
</div>

<style lang="scss" scopred>
  .worker-container {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 70vh;
    will-change: transform;
    padding-bottom: 5rem;
    margin-bottom: 20px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 20px;
  }

  .worker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
