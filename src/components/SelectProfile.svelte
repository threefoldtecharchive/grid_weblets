<svelte:options tag={null} />

<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import type { IProfile } from "../types/Profile";

  const dispatch = createEventDispatcher<{ profile: IProfile }>();
  const EVENT = "profile";

  const configs = window.configs?.baseConfig;
  $: profiles = $configs.profiles;

  onMount(() => {
    dispatch(EVENT, profiles[0]);
  });

  function onSelectProfile(e: Event) {
    dispatch(EVENT, profiles[(e.target as any).selectedIndex]);
  }

  let profile: IProfile;
</script>

<div class="select mb-4" style="display: flex; justify-content: flex-end;">
  <select on:change={onSelectProfile}>
    {#each profiles as _, idx (idx)}
      <option value={idx}>Profile {idx + 1}</option>
    {/each}
  </select>
</div>
