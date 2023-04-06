<svelte:options tag="tf-msg" />

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher<{ removed: number; select: string; init: void }>();

  export let opened = false;
  export let name: string;
  export let selectedID: number = null;
  const onRemove = (idx: number) => () => {
    dispatch("removed", idx);
    opened = !opened;
  };

  onMount(() => {
    dispatch("init");
  });
</script>

<div class={"modal" + (opened ? " is-active" : "")}>
  <div class="modal-background" />
  <div class="modal-card">
    <section class="modal-card-body">
      Are you sure you want to delete {name}?
      <div style="float: right; margin-top: 50px;">
        <button
          class="button is-danger"
          style="background-color: #FF5151; color: #fff"
          on:click|preventDefault|stopPropagation={onRemove(selectedID)}>Delete</button
        >
        <button class="button" on:click|stopPropagation={() => (opened = !opened)}>Cancel</button>
      </div>
    </section>
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
