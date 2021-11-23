<svelte:options tag="tf-alert" />

<script lang="ts">
  export let type: "info" | "success" | "danger";
  export let message: string;
</script>

<div class={"notification is-" + type}>
  /> {message}
</div>
