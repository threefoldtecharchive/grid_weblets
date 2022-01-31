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

  let cpuField: IFormField = { label: "CPU (Cores)", symbol: "cpu", placeholder: "CPU Cores", type: "number", validator: validateCpu, invalid: false };
  let memoryField: IFormField = { label: "Memory (MB)", symbol: "memory", placeholder: "Your Memory in MB", type: "number", validator: validateMemory, invalid: false };
  let diskField: IFormField = { label: "Disk (GB)", symbol: "diskSize", placeholder: "Your Disk size in GB", type: "number", validator: validateDisk, invalid: false };

  let packageField: IFormField = {
    label: "Select Capacity Package",
    symbol: "pkg",
    type: "select",
    options: [
      { label: "Small", value: "sm", selected: true },
      { label: "Meduim", value: "md" },
      { label: "Large", value: "lg" },
      { label: "Other", value: "other" },
    ],
  };

  let selectedPackageIndex: number = 0;
  let selectedPackage: string = "sm";

  function _applyPackage(idx: number) {
    const pkg = packages[idx];
    if (pkg) {
      cpu = pkg.cpu;
      memory = pkg.memory;
      diskSize = pkg.diskSize;
    }
  }

  function onSelectPackage({ detail }: { detail: Event }) {
    const inp = detail.target as HTMLSelectElement;
    _applyPackage(inp.selectedIndex);
  }

  onMount(() => {
    requestAnimationFrame(() => {
      _applyPackage(0);
    })
  })
</script>

<Input
  bind:data={selectedPackage}
  bind:selected={selectedPackageIndex}
  field={packageField}
  on:input={onSelectPackage}
/>

{#if selectedPackage === "other"}
  <Input
    bind:data={cpu}
    bind:invalid={cpuField.invalid}
    field={cpuField}
    />

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
