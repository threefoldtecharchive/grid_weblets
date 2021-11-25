<script lang="ts">
  import Base from "./elements/base/Base.wc.svelte";
  import VM from "./elements/vm/Vm.wc.svelte";
  import Model from "./components/DeploymentModal.svelte";

  const x = {} as any;
  for (let i = 0; i < 200; i++) {
    x["hello " + i] = "world";
  }
</script>

<!-- <Base />
<VM /> -->

<Model data={x} />
