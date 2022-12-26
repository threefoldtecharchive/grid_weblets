<svelte:options tag="tf-select-capacity" />

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { IFormField, IPackage, Packages, SelectCapacityUpdate } from "../types";
  import Input from "./Input.svelte";
  import { isInvalid, validateCpu, validateDisk, validateMemory } from "../utils/validateName";

  const dispatch = createEventDispatcher<{ update: SelectCapacityUpdate }>();

  export let packages: IPackage[];
  export let selectedPackage: Packages = "Minimum";

  const cpuField: IFormField = {label: "CPU (vCores)",symbol: "cpu",placeholder: "CPU vCores",type: "number",validator: validateCpu,invalid: false }; // prettier-ignore
  const memoryField: IFormField = {label: "Memory (MB)",symbol: "memory",placeholder: "Your Memory in MB",type: "number",validator: validateMemory,invalid: false }; // prettier-ignore
  const diskField: IFormField = {label: "Disk (GB)",symbol: "diskSize",placeholder: "Your Disk size in GB",type: "number",validator: validateDisk,invalid: false }; // prettier-ignore

  export let cpu: number;
  export let memory: number;
  export let diskSize: number;

  const packageField: IFormField = {
    label: "Select Solution Flavor",
    symbol: "pkg",
    type: "select",
    options: [
      { label: "Minimum", value: "Minimum", selected: true },
      { label: "Standard", value: "Standard" },
      { label: "Recommended", value: "Recommended" },
      { label: "Custom", value: "Custom" },
    ],
  };

  function notifyListeners() {
    if (selectedPackage === "Custom") {
      return dispatch("update", {
        selectedPackage,
        package: { name: selectedPackage, cpu, memory, diskSize },
        invalid: isInvalid([cpuField, memoryField, diskField]),
      });
    }

    const pkg = packages.find(({ name }) => name === selectedPackage);
    dispatch("update", {
      selectedPackage,
      package: pkg,
      invalid: !pkg,
    });
  }

  let __init = false;
  $: if (packages && !__init) {
    __init = true;
    notifyListeners();
    const options = packageField.options;
    for (const { name, cpu, memory, diskSize } of packages) {
      const option = options.find(({ value }) => value === name);
      option.label += ` (CPU: ${cpu} vCores, Memory: ${memory} MB, Disk: ${diskSize} GB)`;
    }
    packageField.options = options;
  }

  let __selectedPackage: Packages;
  $: if (packages && selectedPackage !== __selectedPackage) {
    requestAnimationFrame(() => {
      __selectedPackage = selectedPackage;
      notifyListeners();
    });
  }
</script>

{#if packages}
  <Input bind:data={selectedPackage} field={packageField} />

  <!-- prettier-ignore -->
  {#if selectedPackage === "Custom"}
    <Input bind:data={cpu} bind:invalid={cpuField.invalid} field={cpuField} on:input={notifyListeners} />
    <Input bind:data={memory} bind:invalid={memoryField.invalid} field={memoryField} on:input={notifyListeners} />
    <Input bind:data={diskSize} bind:invalid={diskField.invalid} field={diskField} on:input={notifyListeners} />
  {/if}
{/if}
