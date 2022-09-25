<svelte:options tag="tf-alert" />

<script lang="ts">
  export let type: "info" | "success" | "danger";
  export let message: string;
  export let domain: string;
  export let planetaryIP: string;

  function selectColor(t: typeof type): string {
    switch (t) {
      case "info":
        return "#1982b1";
      case "danger":
        return "#FF5151";
      case "success":
        return "#1982b1";
      default:
        return "";
    }
  }
</script>

<div
  class="notification"
  style={`background-color: ${selectColor(type)}; color: white`}
>
  {message}
  <hr />
  <h3 style="font-weight: bold;">Deployment Info:</h3>
  <ul class="ml-2">
    <li>
      Domain: <a href={`https://${domain}/`} target="_blank">
        https://{domain}/
      </a>
    </li>
    <li>Planetary IP: {planetaryIP}</li>
  </ul>
</div>
