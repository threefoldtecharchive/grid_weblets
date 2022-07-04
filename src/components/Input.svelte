<svelte:options tag="tf-input" />

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { IFormField } from "../types";
  import { v4 } from "uuid";

  const dispatch = createEventDispatcher<{ input: Event }>();
  export let field: IFormField;
  export let data: any;
  export let selected: number = 0;
  export let invalid = false;
  export let min: string | number = undefined;
  export let max: string | number = undefined;

  $: numericData = data?.toString();

  const id = v4();
  const _isInput = () => ["text", "number", "password", "textarea"].includes(field.type); // prettier-ignore
  let _error: string;

  function _onSelectChange(e: Event) {
    dispatch("input", e);
    const select = e.target as HTMLSelectElement;
    selected = select.selectedIndex;
  }

  function _onInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const isNum = target.getAttribute("data-type") === "number";
    if (field.validator) {
      let __err = field.validator(target.value);
      _error = typeof __err === "string" ? __err : undefined;
      invalid = !!__err;
      /* Hack for now */
    } else if (isNum) {
      (e as any).target.value = +(e as any).target.value;
      let __err = +target.value <= 0 ? "Value must be positive" : null;
      _error = typeof __err === "string" ? __err : undefined;
      invalid = !!__err;
    }

    if (isNum && !invalid) {
      data = +numericData;
    }

    dispatch("input", e);
  }

  let showPassword: boolean = false;
  let _password: HTMLInputElement;

  const selectStyle = `
<style>
  @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");

  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  .switch .switch__input {
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

  .switch__input:checked + .slider {
    background-color: #1982b1;
  }

  .switch__input:checked + .slider {
    box-shadow: 0 0 1px #1982b1; 
  }

  .switch__input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

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

  [disabled] { cursor: inherit !important; }
</style>
`;
</script>

<div>
  {@html selectStyle}
</div>

{#if field}
  <div class="tooltip mb-2">
    {#if _isInput()}
      <div class="field" {id}>
        <p class="label">{field.label}</p>
        <div
          class={"control" +
            (field.type === "password" ? " has-icons-right" : "") +
            (field.loading ? " is-loading" : "")}
        >
          {#if field.type === "textarea"}
            <textarea
              class={"textarea" + (field.error || _error ? " is-danger" : "")}
              placeholder={field.placeholder}
              bind:value={data}
              on:input={_onInput}
              disabled={field.disabled}
            />
          {:else if field.type === "text"}
            <input
              type="text"
              class={"input" + (field.error || _error ? " is-danger" : "")}
              placeholder={field.placeholder}
              bind:value={data}
              on:input={_onInput}
              disabled={field.disabled}
            />
          {:else if field.type === "number"}
            <input
              type="text"
              data-type="number"
              class={"input" + (field.error || _error ? " is-danger" : "")}
              placeholder={field.placeholder}
              bind:value={numericData}
              on:input={_onInput}
              disabled={field.disabled}
              {min}
              {max}
            />
          {:else if field.type === "password"}
            <input
              type="password"
              class={"input" + (field.error || _error ? " is-danger" : "")}
              placeholder={field.placeholder}
              bind:value={data}
              on:input={_onInput}
              disabled={field.disabled}
              bind:this={_password}
            />
            <span
              style="position: absolute; top: 50%; right: 15px; transform: translateY(-50%); cursor: pointer;"
              on:click={() => {
                showPassword = !showPassword;
                _password.type = showPassword ? "text" : "password";
              }}
            >
              <i
                class={"fas " + (!showPassword ? "far fa-eye-slash" : "fa-eye")}
              />
            </span>
          {/if}
        </div>
        {#if field.error || _error}
          <p class="help is-danger">
            {field.error || _error}
          </p>
        {/if}
      </div>
    {:else if field.type === "checkbox"}
      <div style="display: flex; align-items: center;" class="mb-2">
        <label class="switch">
          <input
            class="switch__input"
            type="checkbox"
            bind:checked={data}
            {id}
            on:input
            disabled={field.disabled}
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
      <div
        class={"select mb-2" + (field.error || _error ? " is-danger" : "")}
        style="width: 100%;"
        {id}
      >
        <select
          disabled={field.disabled}
          style="width: 100%;"
          bind:value={data}
          on:change={_onSelectChange}
        >
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
        {#if field.error || _error}
          <p class="help is-danger">
            {field.error || _error}
          </p>
        {/if}
      </div>
    {/if}

    {#if field.tooltip}
      <span class="tooltip__text">
        {field.tooltip}
      </span>
    {/if}
  </div>
{/if}
