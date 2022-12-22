<svelte:options tag="tf-multi-select" />

<script context="module" lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  export interface Options {
    [key: string]: any;
  }
</script>

<script lang="ts">
  const dispatch = createEventDispatcher<{ select: any[] }>();

  export let options: Options = {};
  export let selected: any[] = [];
  export let disabled = false;

  let input: HTMLInputElement;
  let filter = "";
  let active = false;

  function getLabel(value: any): string {
    for (const label in options) {
      if (options[label] === value) {
        return label;
      }
    }
  }

  function toggleSelected(value: any): void {
    if (selected.includes(value)) {
      selected = selected.filter(x => x !== value);
    } else {
      selected = [...selected, value];
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && filter !== "") {
      const __options = _options.filter(([label]) => {
        return label.toLocaleLowerCase().includes(filter);
      });

      if (__options.length) {
        toggleSelected(__options[0][1]);
        filter = "";
      }
    }
  }

  const notify = () => dispatch("select", selected);

  $: _options = Object.entries(options);
  $: selected && notify();
  onMount(notify);

  const styles = `
    <style>
        @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

        .dropdown-content::-webkit-scrollbar {
            width: 20px;
        }

        .dropdown-content::-webkit-scrollbar-track {
            background-color: transparent;
        }

        .dropdown-content::-webkit-scrollbar-thumb {
            background-color: #ccc;
            border: 6px solid transparent;
            background-clip: content-box;
        }
    </style>
  `;
</script>

<div>
  {@html styles}
</div>

<section class="pt-3" on:mousedown|preventDefault|stopPropagation={() => input?.focus()}>
  <div class="field is-grouped is-grouped-multiline p-2" style:border="1px solid #ccc" style:border-radius="3px">
    {#each selected as value}
      <div class="control mb-2">
        <div class="tags has-addons">
          <span class="tag mb-0" style="background-color: #1982b1; color:#fff">{getLabel(value)}</span>
          <span class="tag is-delete mb-0" style:cursor="pointer" on:mousedown={() => toggleSelected(value)} />
        </div>
      </div>
    {/each}
    {#if !disabled}
      <input
        bind:this={input}
        placeholder="Please select a node"
        type="text"
        class="input pt-0 pb-0"
        style:flex="1"
        style:height="24px"
        style:min-width="100px"
        style:border="none"
        style:outline="none"
        style:box-shadow="none"
        bind:value={filter}
        on:focus={() => (active = true)}
        on:blur={() => (active = false)}
        on:keydown={onKeyDown}
      />
    {/if}
  </div>
  <div class="dropdown" class:is-active={active} style:width="100%">
    <div class="dropdown-menu" role="menu" style:width="100%">
      <div class="dropdown-content" style:max-height="min(50vh, 400px)" style:overflow-y="scroll">
        {#each _options as [label, value] (value)}
          {#if label.toLocaleLowerCase().includes(filter)}
            <a
              href="#!"
              on:click|preventDefault|stopPropagation={() => {
                toggleSelected(value);
              }}
              class="dropdown-item is-flex is-align-items-center"
              class:is-active={selected.includes(value)}
            >
              <input class="checkbox mr-3" type="checkbox" checked={selected.includes(value)} />
              {label}
            </a>
          {/if}
        {/each}
      </div>
    </div>
  </div>
</section>
