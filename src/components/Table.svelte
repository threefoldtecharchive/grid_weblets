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
  export let selectedRows: number[] = [];

  $: footer = rows && rows.length > 49;

  let _selectedRows: number[] = [];

  function onSelectHandler(idx: number) {
    const i = _selectedRows.indexOf(idx);
    if (i > -1) {
      _selectedRows = _selectedRows.filter((i) => i !== idx);
    } else {
      _selectedRows = [..._selectedRows, idx];
    }
    dispatch("selected", _selectedRows.map(i => rowsData[i])); // prettier-ignore
  }

  function onSelectAllHandler(e: Event) {
    const inp = e.target as HTMLInputElement;
    _selectedRows = inp.checked ? Array.from({ length: rows.length }, (_, i) => i) : []; // prettier-ignore
    dispatch("selected", inp.checked ? rowsData : []);
  }

  $: allChecked = _selectedRows.length === rows?.length;
  $: {
    _selectedRows = selectedRows;
    dispatch(
      "selected",
      selectedRows.map((i) => rowsData[i])
    );
  }
</script>

<table class="table" style="width: 100%;">
  <thead>
    <tr>
      {#if selectable}
        <th>
          <input
            type="checkbox"
            on:change={onSelectAllHandler}
            checked={allChecked}
          />
        </th>
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
                checked={_selectedRows.includes(idx)}
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
