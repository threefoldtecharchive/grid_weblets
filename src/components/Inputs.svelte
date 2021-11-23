<svelte:options tag="tf-inputs" />

<script lang="ts">
  import type { IFormField } from "../types";
  import Input from "./Input.svelte";

  export let fields: IFormField[];
  export let data: any;
</script>

{#if fields && data}
  {#each fields as field (field.symbol)}
    <Input bind:data {field} />
  {/each}
{/if}
