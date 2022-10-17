<svelte:options tag="tf-select-capacity" />

<script lang="ts">
  import type { IFormField, IPackage } from "../types";
  import Input from "./Input.svelte";
  import {
  isInvalid,
    validateCpu,
    validateDisk,
    validateMemory,
  } from "../utils/validateName";
  import { onMount, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ invalid: boolean }>();

  export let cpu: number;
  export let memory: number;
  export let diskSize: number;
  export let packages: IPackage[];


  const __cpuField: IFormField = {
    label: "CPU (vCores)",
    symbol: "cpu",
    placeholder: "CPU vCores",
    type: "number",
    validator: validateCpu,
    invalid: false,
  };
  const __memoryField: IFormField = {
    label: "Memory (MB)",
    symbol: "memory",
    placeholder: "Your Memory in MB",
    type: "number",
    validator: validateMemory,
    invalid: false,
  };
  const __diskField: IFormField = {
    label: "Disk (GB)",
    symbol: "diskSize",
    placeholder: "Your Disk size in GB",
    type: "number",
    validator: validateDisk,
    invalid: false,
  };

  const packageField: IFormField = {
    label: "Select Solution Flavor",
    symbol: "pkg",
    type: "select",
    options: [
      { label: "Minimum", value: "min", selected: true },
      { label: "Standard", value: "std" },
      { label: "Recommended", value: "rec" },
      { label: "Custom", value: "cust" },
    ],
  };

  let selectedPackageIndex: number = 0;
  let selectedPackage: string = "min";

  function _applyPackage(idx: number) {
    const pkg = packages[idx];
    if (pkg) {
      cpu = pkg.cpu;
      memory = pkg.memory;
      diskSize = pkg.diskSize;
    }
  }

  function _package_spec(idx: number) {
    const pkg = packages[idx];
    let spec = "";
    if (pkg) {
      spec = ` (CPU: ${pkg.cpu} vCores, Memory: ${pkg.memory} MB, Disk: ${pkg.diskSize} GB)`;
    }
    return spec;
  }

  function onSelectPackage({ detail }: { detail: Event }) {
    const inp = detail.target as HTMLSelectElement;
    _applyPackage(inp.selectedIndex);
  }

  onMount(() => {
    requestAnimationFrame(() => {
      _applyPackage(0);
      for (var _i = 0; _i < 3; _i++) {
        packageField.options[_i].label += _package_spec(_i);
      }
    });
  });

  $: dispatch("invalid", isInvalid([__cpuField, __diskField, __memoryField]))
</script>

<Input
bind:data={selectedPackage}
bind:selected={selectedPackageIndex}
field={packageField}
on:input={onSelectPackage}
/>

{#if selectedPackage === "cust"}
  <Input bind:data={cpu} bind:invalid={__cpuField.invalid} field={__cpuField} />

  <Input
    bind:data={memory}
    bind:invalid={__memoryField.invalid}
    field={__memoryField}
  />

  <Input
    bind:data={diskSize}
    bind:invalid={__diskField.invalid}
    field={__diskField}
  />
{/if}
