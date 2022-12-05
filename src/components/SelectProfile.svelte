<svelte:options tag="tf-select-profile" />

<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from "svelte";
  import type { Profile } from "../stores/baseConfig";

  const dispatch = createEventDispatcher<{ profile: Profile }>();

  let _sub: () => void;
  onDestroy(_sub);
  onMount(() => {
    _sub = window.configs.baseConfig.subscribe(profile => {
      dispatch("profile", profile);
    });
  });
</script>
