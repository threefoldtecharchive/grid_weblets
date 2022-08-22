<script lang="ts">
  import Base from "./elements/base/Base.wc.svelte";
  import ProfileManager from "./elements/profiles/Profiles.wc.svelte";
  import VM from "./elements/vm/Vm.wc.svelte";
  import K8S from "./elements/kubernetes/Kubernetes.wc.svelte";

  const baseConfig = window.configs.baseConfig;
  $: data = $baseConfig;
</script>

<Base />
<ProfileManager />
<VM />

<K8S />
