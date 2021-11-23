<svelte:options tag="tf-input" />

<script lang="ts">
  import { onMount } from "svelte";
  import type { IFormField } from "../types";
  import { v4 } from "uuid";

  export let field: IFormField;
  export let data: any;

  let _input: HTMLInputElement;
  const _isInput = () => ["text", "number", "password", "textarea"].includes(field.type); // prettier-ignore
  const id = v4();

  onMount(() => {
    if (_input) {
      _input.type = field.type;
    }
  });
</script>

{#if field}
  {#if _isInput()}
    <div class="field" {id}>
      <p class="label">{field.label}</p>
      <div class="control">
        {#if field.type === "textarea"}
          <textarea
            class="textarea"
            placeholder={field.placeholder}
            bind:value={data[field.symbol]}
            on:change
          />
        {:else}
          <input
            bind:this={_input}
            class="input"
            placeholder={field.placeholder}
            bind:value={data[field.symbol]}
            on:change
          />
        {/if}
      </div>
    </div>
  {:else if field.type === "checkbox"}
    <div style="display: flex; align-items: center;" class="mb-2">
      <label class="switch">
        <input
          type="checkbox"
          bind:checked={data[field.symbol]}
          {id}
          on:change
        />
        <span class="slider" />
      </label>
      <label for={id} class="label ml-2" style="cursor: pointer;">
        {field.label}
      </label>
    </div>
  {:else if field.type === "select"}
    {#if field.label}
      <p class="label">{field.label}</p>
    {/if}
    <div class="select mb-2" {id}>
      <select on:change bind:value={data[field.symbol]}>
        {#each field.options as option (option.value)}
          <option
            value={option.value}
            selected={option.selected}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        {/each}
      </select>
    </div>
  {/if}
{/if}

<style scoped lang="scss">
  .select,
  .select > select {
    width: 100%;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: 0.4s;
      transition: 0.4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: 0.4s;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #2196f3;
    }

    input:checked + .slider {
      box-shadow: 0 0 1px #2196f3;
    }

    input:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }
  }
</style>
