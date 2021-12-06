<svelte:options tag="tf-table" />

<script lang="ts">
  interface IAction {
    type: "info" | "success" | "warning" | "danger";
    label: string;
    click: (e: Event, index: number) => void;
    disabled?: (index: number) => boolean;
    loading?: (index: number) => boolean;
  }

  export let headers: string[];
  export let rows: string[][];
  export let actions: IAction[] = [];

  $: footer = rows && rows.length > 49;
</script>

<table class="table" style="width: 100%;">
  <thead>
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
  </thead>

  <tbody>
    {#if rows}
      {#each rows as row, idx}
        <tr>
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
