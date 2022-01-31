<svelte:options tag="tf-select-capacity" />

<script lang="ts">
  import type { IFormField } from "../types";
  import Input from "./Input.svelte";
  import {
    validateCpu,
    validateDisk,
    validateMemory,
  } from "../utils/validateName";

  export let data;
  export let cpu;
  export let memory;
  export let diskSize;
  export let packages; // dependes on each solution

  let capacityFields: IFormField[] = [
    {
      label: "CPU (Cores)",
      symbol: "cpu",
      placeholder: "CPU Cores",
      type: "number",
      validator: validateCpu,
      invalid: false,
    },
    {
      label: "Memory (MB)",
      symbol: "memory",
      placeholder: "Your Memory in MB",
      type: "number",
      validator: validateMemory,
      invalid: false,
    },
    {
      label: "Disk (GB)",
      symbol: "diskSize",
      placeholder: "Your Disk size in GB",
      type: "number",
      validator: validateDisk,
      invalid: false,
    },
  ];

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

  // $: {
  //   if (packages) {
  //     const option = packageField.options[selectedPackageIndex];
  //     console.log("here");
  //     if (option.value !== "other") {
  //       const pkg = packages[selectedPackageIndex];
  //       console.log("here2");

  //       cpu = pkg.cpu;
  //       memory = pkg.memory;
  //       diskSize = pkg.diskSize;
  //     }
  //   }
  // }

  function onSelectPackage({ detail }: { detail: Event }) {
    console.log(detail);
    const inp = detail.target as HTMLSelectElement;
    const pkg = packages[inp.selectedIndex];
    if (pkg) {
      cpu = pkg.cpu;
      memory = pkg.memory;
      diskSize = pkg.diskSize;
    }
  }
</script>

<Input
  bind:data={selectedPackage}
  bind:selected={selectedPackageIndex}
  field={packageField}
  on:input={onSelectPackage}
/>

{#each capacityFields as field (field.symbol)}
  {#if field.invalid !== undefined}
    <Input
      bind:data={data[field.symbol]}
      bind:invalid={field.invalid}
      field={{
        ...field,
        disabled: selectedPackage !== "other",
      }}
    />
  {:else}
    <Input
      bind:data={data[field.symbol]}
      field={{
        ...field,
        disabled: selectedPackage !== "other",
      }}
    />
  {/if}
{/each}
