<svelte:options tag="tf-delete-btn" />

<script lang="ts">
  export let name: string;
</script>

<div class="is-flex is-justify-content-space-between is-align-items-center">
  <p class="is-size-5 has-text-weight-bold">{name}</p>
  <button type="button" class="button is-danger" on:click>
    <span>-</span>
  </button>
</div>
