<svelte:options tag="tf-table" />

<script lang="ts">
  interface IAction {
    type: "info" | "success" | "warning" | "danger";
    label: string;
    click: (e: Event) => void;
    disabled?: boolean;
    loading?: boolean;
  }

  export let headers: string[];
  export let rows: string[][];
  export let actions: IAction[] = [];
</script>

<table class="table" style="width: 100%;">
  <thead>
    <tr>
      {#each headers as hd (hd)}
        <th title={hd}>{hd}</th>
      {/each}

      {#if actions.length}
        <th title="Actions">Actions</th>
      {/if}
    </tr>
  </thead>

  <tbody>
    {#each rows as row}
      <tr>
        {#each row as item (item)}
          <td>{item}</td>
        {/each}

        {#if actions.length}
          <td>
            <div class="buttons">
              {#each actions as { type, label, click, disabled, loading }}
                <button
                  class={"button is-" + type + (loading ? " is-loading" : "")}
                  on:click={click}
                  {disabled}
                >
                  {label}
                </button>
              {/each}
            </div>
          </td>
        {/if}
      </tr>
    {/each}
  </tbody>

  <tfoot>
    <tr>
      {#each headers as hd (hd)}
        <th title={hd}>{hd}</th>
      {/each}

      {#if actions.length}
        <th title="Actions">Actions</th>
      {/if}
    </tr>
  </tfoot>
</table>
