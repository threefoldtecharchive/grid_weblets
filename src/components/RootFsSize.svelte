<svelte:options tag="tf-root-fs-size" />

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher<{ update: number }>();

  import rootFs from "../utils/rootFs";
  import Input from "./Input.svelte";

  export let cpu: number;
  export let memory: number;

  let editable = false;

  let size: number;
  $: {
    if (!editable) {
      size = rootFs(cpu, memory);
      dispatch("update", size);
    }
  }
</script>

<div style="display: flex; align-items: center;">
  <div style="margin-right: 15px; width: 100%;">
    <Input
      bind:data={size}
      on:input={() => {
        dispatch("update", size);
      }}
      field={{
        label: `Root File System (GB)`,
        placeholder: "rootFs Size",
        symbol: "rootFs",
        type: "number",
        error:
          editable && size < rootFs(cpu, memory)
            ? `RootFs value can't be less than ${rootFs(cpu, memory)}`
            : undefined,
        disabled: !editable,
        validator() {},
      }}
    />
  </div>
  <div>
    <Input
      bind:data={editable}
      field={{
        label: "",
        symbol: "editable",
        type: "checkbox",
      }}
    />
  </div>
</div>
