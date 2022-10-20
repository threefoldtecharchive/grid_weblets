<svelte:options tag="tf-select-capacity" />

<script lang="ts">
  import type { IFormField, IPackage } from "../types";
  import Input from "./Input.svelte";
  import {
    validateCpu,
    validateDisk,
    validateMemory,
  } from "../utils/validateName";
  import { onMount } from "svelte";

  export let cpu: number;
  export let memory: number;
  export let diskSize: number;
  export let packages: IPackage[];

  export let cpuField: IFormField = {
    label: "CPU (vCores)",
    symbol: "cpu",
    placeholder: "CPU vCores",
    type: "number",
    validator: validateCpu,
    invalid: false,
  };
  export let memoryField: IFormField = {
    label: "Memory (MB)",
    symbol: "memory",
    placeholder: "Your Memory in MB",
    type: "number",
    validator: validateMemory,
    invalid: false,
  };
  export let diskField: IFormField = {
    label: "Disk (GB)",
    symbol: "diskSize",
    placeholder: "Your Disk size in GB",
    type: "number",
    validator: validateDisk,
    invalid: false,
  };

  let packageField: IFormField = {
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
</script>

<Input
  bind:data={selectedPackage}
  bind:selected={selectedPackageIndex}
  field={packageField}
  on:input={onSelectPackage}
/>

{#if selectedPackage === "cust"}
  <Input bind:data={cpu} bind:invalid={cpuField.invalid} field={cpuField} />

  <Input
    bind:data={memory}
    bind:invalid={memoryField.invalid}
    field={memoryField}
  />

  <Input
    bind:data={diskSize}
    bind:invalid={diskField.invalid}
    field={diskField}
  />
{/if}
