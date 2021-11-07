<script lang="ts">
  import router from "page";
  import MDViewer from "../views/MDViewer.svelte";

  let ctx: PageJS.Context;
  router("*", (_ctx) => (ctx = _ctx));
  router.start();
</script>

<MDViewer {ctx} />
