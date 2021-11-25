<script lang="ts">
  import type { IFormField } from "../types";

  export let data: Object;

  // fields
  const nameField: IFormField = { label: "Name", symbol: "name", type: "text", disabled: true }; // prettier-ignore
  const publicIpField: IFormField = { label: "Public IP", symbol: "publicIP", type: "text", disabled: true }; // prettier-ignore
  const networkField: IFormField = { label: "Network Name", symbol: "network", type: "text", disabled: true }; // prettier-ignore
  const cpuField: IFormField = { label: "CPU", symbol: "cpu", type: "number", disabled: true }; // prettier-ignore
  const memoryField: IFormField = { label: "Memory", symbol: "memory", type: "number", disabled: true }; // prettier-ignore
  const diskField: IFormField = { label: "Disk", symbol: "size", type: "number", disabled: true }; // prettier-ignore
  const wireguardField: IFormField = { label: "WireGuard", symbol: "wireguard", type: "text", disabled: true }; // prettier-ignore
  const flistField: IFormField = { label: "Flist", symbol: "flist", type: "text", disabled: true }; // prettier-ignore
</script>
