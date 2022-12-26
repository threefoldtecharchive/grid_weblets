<svelte:options tag="tf-root-fs-size" />

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher<{ update: number; editableUpdate: boolean }>();

  import rootFsUtil from "../utils/rootFs";
  import Input from "./Input.svelte";

  export let rootFs: number;
  export let editable: boolean;
  export let cpu: number;
  export let memory: number;

  let size: number;
  let _init = false;
  $: {
    if (editable !== undefined && cpu !== undefined && memory !== undefined) {
      if (!editable) {
        size = rootFsUtil(cpu, memory);
        dispatch("update", size);
      } else if (!_init) {
        _init = true;
        size = rootFs;
      }
    }
  }

  function _updateEditable(e: Event) {
    const input = e.target as HTMLInputElement;
    dispatch("editableUpdate", input.checked);
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
          editable && size < rootFsUtil(cpu, memory)
            ? `RootFs value can't be less than ${rootFsUtil(cpu, memory)}`
            : undefined,
        disabled: !editable,
      }}
    />
  </div>
  <div style="margin-top: 30px;">
    <Input
      data={editable}
      field={{
        label: "",
        symbol: "editable",
        type: "checkbox",
      }}
      on:input={_updateEditable}
    />
  </div>
</div>
