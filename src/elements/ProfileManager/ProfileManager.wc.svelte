<script lang="ts">
  const activeProfile = window.configs.activeProfileStore;

  $: activeProfile$ = $activeProfile;
  $: __balance = activeProfile$?.balance;
  $: balance$ = $__balance;
</script>

<section class="is-flex is-justify-content-end p-2">
  <div style:width="100%" />

  <div class="box is-flex is-align-items-center">
    <span
      class="icon pr-5 pl-5 mr-3"
      style:height="100%"
      style:border-right={activeProfile$ ? '1px solid #ccc' : null}
      style:font-size="25px"
    >
      <i class="fas fa-user-cog" />
    </span>

    {#if activeProfile$}
      <div style:white-space="nowrap">
        <p>
          <strong>{activeProfile$.name}</strong>
        </p>
        {#if balance$}
          <p>Balance: <strong>{balance$.balance}</strong> TFT</p>
          <p>Locked: <strong>{balance$.locked}</strong> TFT</p>
        {:else}
          <p>Loading Account Balance...</p>
        {/if}
      </div>
    {/if}
  </div>
</section>

<style lang="scss" scoped>
  @import url('https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
</style>
