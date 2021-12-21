<svelte:options tag="tf-version" />

<script lang="ts">
  $: version = window.configs?.version;
</script>

{#if version}
  <div class="is-flex is-justify-content-flex-end mt-4">
    <span class="tag is-primary is-light" title={`Version: ${version}`}>
      v.{version}
    </span>
  </div>
{/if}
