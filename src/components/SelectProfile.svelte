<svelte:options tag={null} />

<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ profileIdx: number }>();
  const EVENT = "profileIdx";

  const configs = window.configs?.baseConfig;
  $: profiles = $configs;

  onMount(() => {
    dispatch(EVENT, 0);
  });

  function onSelectProfile(e: Event) {
    dispatch(EVENT, (e.target as any).selectedIndex);
  }
</script>

<div class="select mb-4" style="display: flex; justify-content: flex-end;">
  <select on:change={onSelectProfile}>
    {#each profiles as profile, idx (idx)}
      <option value={idx}
        >{#if profile.name}
          {profile.name}
        {:else}
          Profile {idx + 1}
        {/if}</option
      >
    {/each}
  </select>
</div>
