<svelte:options tag="tf-table" />

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { IAction } from "../types/table-action";

  const dispatch = createEventDispatcher<{ selected: any[] }>();

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

  const style = `
    <style>
      @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
      @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");
      th, td {
        white-space: nowrap;
      }  
      .icon {
        color: #454545 !important;
        cursor: pointer;
      }
    </style>
  `;
</script>

<div>
  {@html style}
</div>

<div style="width: 100%; overflow-x: auto;">
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
                {#each actions as { type, label, click, disabled, loading }}
                  {#if label == "Show Details"}
                    <span
                      title={label}
                      class={"icon " +
                        (loading && loading(idx) ? " is-loading" : "")}
                      on:click={(e) => click(e, idx)}
                      disabled={disabled ? disabled(idx) : false}
                    >
                      <i class="fa-solid fa-eye" />
                    </span>
                  {:else if label == "Visit"}
                    <span
                      title={label}
                      class={"icon " +
                        (loading && loading(idx) ? " is-loading" : "")}
                      on:click={(e) => click(e, idx)}
                      disabled={disabled ? disabled(idx) : false}
                    >
                      <i class="fa-solid fa-globe" />
                    </span>
                  {:else if label == "Admin Panel"}
                    <span
                      title={label}
                      class={"icon " +
                        (loading && loading(idx) ? " is-loading" : "")}
                      on:click={(e) => click(e, idx)}
                      disabled={disabled ? disabled(idx) : false}
                    >
                      <i class="fa-solid fa-user-gear" />
                    </span>
                  {:else if label == "Manage Workers"}
                    <span
                      title={label}
                      class={"icon " +
                        (loading && loading(idx) ? " is-loading" : "")}
                      on:click={(e) => click(e, idx)}
                      disabled={disabled ? disabled(idx) : false}
                    >
                      <i class="fa-solid fa-gears" />
                    </span>
                  {:else if label == "Delete"}
                    <span
                      title={label}
                      class={"icon " +
                        type +
                        (loading && loading(idx) ? " is-loading" : "")}
                      on:click={(e) => click(e, idx)}
                      disabled={disabled ? disabled(idx) : false}
                    >
                      <i class="fa-solid fa-trash-can" />
                    </span>
                  {/if}
                {/each}
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
</div>
