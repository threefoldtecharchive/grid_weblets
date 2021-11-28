<svelte:options tag="tf-select-profile" />

<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from "svelte";
  const configs = window.configs?.baseConfig;
  import type { IProfile } from "../types/Profile";

  const dispatch = createEventDispatcher<{ profile: IProfile }>();

  let _sub: () => void;
  onMount(() => {
    _sub = configs.subscribe(() => {
      dispatch("profile", configs.getActiveProfile());
    });
  });

  onDestroy(() => {
    _sub();
  });
</script>

<!-- <script lang="ts">
  import { onDestroy, createEventDispatcher, onMount } from "svelte";
  import Input from "./Input.svelte";
  import type { IProfile } from "../types/Profile";
  import type { ISelectOption } from "../types";

  const dispatch = createEventDispatcher<{ profile: IProfile }>();

  let selected = "0";
  const configs = window.configs?.baseConfig;
  let profiles: IProfile[];
  let options: ISelectOption[] = [];

  function onUpdateProfile() {
    profiles = $configs;
    options = profiles.map((p, i) => {
      return { label: p.name || `Profile ${i + 1}`, value: i.toString() };
    });
    dispatch("profile", profiles[selected]);
  }

  let _sub = configs.subscribe(() => {
    onUpdateProfile();
  });

  onMount(onUpdateProfile);
  onDestroy(_sub);
</script>

<div class="is-flex is-justify-content-flex-end is-align-items-center">
  <div>
    <Input
      on:input={onUpdateProfile}
      bind:data={selected}
      field={{ type: "select", symbol: "selected", options }}
    />
  </div>
</div>

<style lang="scss">
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style> -->
