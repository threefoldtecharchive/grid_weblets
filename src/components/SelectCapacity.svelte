<svelte:options tag="tf-select-capacity" />

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type {
    IFormField,
    IPackage,
    Packages,
    SelectCapacityUpdate,
  } from "../types";
  import Input from "./Input.svelte";

  const dispatch = createEventDispatcher<{ update: SelectCapacityUpdate }>();
  export let packages: IPackage[];
  export let selectedPackage: Packages = "Minimum";

  const packageField: IFormField = {
    label: "Select Solution Flavor",
    symbol: "pkg",
    type: "select",
    options: [
      { label: "Minimum", value: "Minimum", selected: true },
      { label: "Standard", value: "Standard" },
      { label: "Recommended", value: "Recommended" },
    ],
  };

  function notifyListeners() {
    const pkg = packages.find(({ name }) => name === selectedPackage);
    dispatch("update", {
      selectedPackage,
      package: pkg,
      invalid: !pkg,
    });
  }

  let __init = false;
  onMount(() => {
    requestAnimationFrame(() => {
      __init = true;
      notifyListeners();
      const options = packageField.options;
      for (const { name, cpu, memory, diskSize } of packages) {
        const option = options.find(({ value }) => value === name);
        option.label += ` (CPU: ${cpu} vCores, Memory: ${memory} MB, Disk: ${diskSize} GB)`;
      }
      packageField.options = options;
    });
  });

  let __selectedPackage: Packages;
  $: if (__init && selectedPackage !== __selectedPackage) {
    __selectedPackage = selectedPackage;
    notifyListeners();
  }
</script>

<Input bind:data={selectedPackage} field={packageField} />
