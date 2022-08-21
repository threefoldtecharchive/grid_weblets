<script lang="ts">
  import { get } from "svelte/store";

  import Base from "./elements/base/Base.wc.svelte";
  import ProfileManager from "./elements/profiles/Profiles.wc.svelte";
  import VM from "./elements/vm/Vm.wc.svelte";
</script>

<Base />
<ProfileManager />
<VM />

{JSON.stringify(get(window.configs.baseConfig)?.profiles)}
