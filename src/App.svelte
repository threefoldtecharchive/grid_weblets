<script lang="ts">
  import type { IFormField } from "./types";
  import Input from "./components/Input.svelte";

  let data = "";
  const field: IFormField = {
    label: "Name",
    type: "text",
    symbol: "name",
    placeholder: "Fill in your name",
    tooltip: "Your Real Name",
    // prettier-ignore
    validator(name: string) {
      if (!name.match(/[a-z]/)) return "Name must include at least one lower letter";
      if (!name.match(/[A-Z]/)) return "Name must include at least one upper letter";
      if (!name.match(/[0-9]/)) return "Name must include at least one number";
      if (name.length < 6) return "Name must be at least 6 chars long";
      if (name.length > 15) return "Name must be at most 15 chars long";
    },
  };
</script>

<div style="padding: 25px;">
  <Input bind:data {field} />
</div>
