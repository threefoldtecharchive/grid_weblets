<svelte:options tag="tf-disclaimer" />

<script lang="ts">
  const envs = {
    dev: { env: "development", url: "https://github.com/threefoldtech/test_feedback/issues" },
    test: { env: "testing", url: "https://github.com/threefoldtech/test_feedback/issues" },
    qa: { env: "QA", url: "https://github.com/threefoldtech/test_feedback/issues" },
    custom: { env: "customized", url: "https://github.com/threefoldtech/test_feedback/issues" },
  };

  $: env = envs[window.env?.NETWORK];
</script>

{#if env}
  <div style="padding: 15px;">
    <form class="box">
      <p class="is-size-4 has-text-weight-bold">Disclaimer</p>
      <p>
        This is a {env.env} environment. We're still ironing out the kinks. If there are any issues, please let us know
        <a href={env.url} target="_blank"> here. </a>
      </p>
    </form>
  </div>
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
