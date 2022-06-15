<svelte:options tag="tf-qrcode" />

<script lang="ts">
  export let value: string = "";
  export let size: string = "200";

  let image: string = "";

  import QRCode from 'qrcode';

  var opts = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    quality: 0.3,
    margin: 1,
    color: {
        dark:"#010599FF",
        light:"#FFBF60FF"
    }
  }

  QRCode.toDataURL(value, opts, function (err, url) {
    if (err) throw err
        image = url;
    console.log(image);
  })

</script>

<img src={image} alt={value} style="size: {size};"/>

