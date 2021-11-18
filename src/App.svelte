<script lang="ts">
  import Base from "./elements/base/Base.wc.svelte";
  // import VM from "./elements/vm/Vm.wc.svelte";
  import K8S from "./elements/kubernetes/Kubernetes.wc.svelte";
  // import CapRover from "./elements/caprover/Caprover.wc.svelte";
  // import DL from "./elements/DeployedList/DeployedList.wc.svelte";
  import Profiles from "./elements/profiles/Profiles.wc.svelte";
</script>

<Base />

<Profiles />

<K8S />
<!-- <VM />
<CapRover />
<DL />
<DL tab="k8s" /> -->
