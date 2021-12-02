<svelte:options tag="tf-notification" />

<script lang="ts">
  const notification = window.configs?.notificationStore;

  import Alert from "../../components/Alert.svelte";
</script>

<section class="notification-container">
  {#each $notification.notifications as { type, message }}
    <Alert {type} {message} />
  {/each}
</section>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");

  .notification-container {
    z-index: 9999;
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateY(-50%);
    width: 300px;
  }
</style>
