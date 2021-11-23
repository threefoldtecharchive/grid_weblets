<svelte:options tag="tf-select-profile" />

<script lang="ts">
  import Input from "./Input.svelte";
  import type { IProfile } from "../types/Profile";
  import type { ISelectOption } from "../types";

  let data = { selected: "0" };
  const configs = window.configs?.baseConfig;
  let profiles: IProfile[];
  let options: ISelectOption[] = [];

  export let profile: IProfile;

  $: {
    if (configs) {
      profiles = $configs;
      options = profiles.map((p, i) => {
        return { label: p.name || `Profile ${i + 1}`, value: i.toString() };
      });
      profile = profiles[data.selected];
    }
  }
</script>

<div class="select-profile">
  <div>
    <Input
      on:change
      bind:data
      field={{ type: "select", symbol: "selected", options }}
    />
  </div>
</div>

<style lang="scss">
  .select-profile {
    display: flex;
    justify-content: flex-end;
  }
</style>
