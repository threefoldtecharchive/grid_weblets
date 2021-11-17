<script lang="ts">
  import DeployedList from "../elements/DeployedList/DeployedList.svelte";
  import K from "../elements/kubernetes/Kubernetes.wc.svelte";
  export let ctx: PageJS.Context;
  console.log(ctx);
</script>

<div style="padding: 20px;">
  <K />
  <DeployedList />
</div>
