<svelte:options tag="tf-qrcode" />

<script lang="ts">
  import QRCode from "qrcode";
  export let value: string = "";
  export let size: string = "200";

</script>


{#await QRCode.toDataURL(value)}
  <p>Generating QR Code...</p>
{:then src}
  <img {src} alt={value} width={size} />
{:catch err}
  <p>Failed to generate QR Code.</p>
{/await}
