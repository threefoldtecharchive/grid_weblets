<svelte:options tag="tf-table" />

<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ selected: any[] }>();

  interface IAction {
    type: "info" | "success" | "warning" | "danger";
    label: string;
    click: (e: Event, index: number) => void;
    disabled?: (index: number) => boolean;
    loading?: (index: number) => boolean;
  }

  export let rowsData: any[] = [];
  export let headers: string[];
  export let rows: string[][];
  export let actions: IAction[] = [];
  export let selectable: boolean = true;

  $: footer = rows && rows.length > 49;

  const _selectedRows: number[] = [];

  function onSelectHandler(idx: number) {
    const i = _selectedRows.indexOf(idx);
    if (i > -1) {
      _selectedRows.splice(i, 1);
    } else {
      _selectedRows.push(idx);
    }

    dispatch("selected", _selectedRows.map(i => rowsData[i])); // prettier-ignore
  }
</script>

<table class="table" style="width: 100%;">
  <thead>
    <tr>
      {#if selectable}
        <th />
      {/if}

      {#if headers}
        {#each headers as hd (hd)}
          <th title={hd}>{hd}</th>
        {/each}
      {/if}

      {#if actions.length}
        <th title="Actions">Actions</th>
      {/if}
    </tr>
  </thead>

  <tbody>
    {#if rows}
      {#each rows as row, idx}
        <tr>
          {#if selectable}
            <td>
              <input
                type="checkbox"
                on:change={onSelectHandler.bind(undefined, idx)}
              />
            </td>
          {/if}

          {#each row as item (item)}
            <td>{item}</td>
          {/each}

          {#if actions.length}
            <td>
              <div class="buttons">
                {#each actions as { type, label, click, disabled, loading }}
                  <button
                    class={"button is-" +
                      type +
                      (loading && loading(idx) ? " is-loading" : "")}
                    on:click={(e) => click(e, idx)}
                    disabled={disabled ? disabled(idx) : false}
                  >
                    {label}
                  </button>
                {/each}
              </div>
            </td>
          {/if}
        </tr>
      {/each}
    {/if}
  </tbody>

  {#if footer}
    <tfoot>
      <tr>
        {#if headers}
          {#each headers as hd (hd)}
            <th title={hd}>{hd}</th>
          {/each}
        {/if}

        {#if actions.length}
          <th title="Actions">Actions</th>
        {/if}
      </tr>
    </tfoot>
  {/if}
</table>
