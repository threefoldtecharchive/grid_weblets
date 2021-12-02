<svelte:options tag="tf-format-data" />

<script lang="ts">
  import type { IFormField } from "../types";
  import Input from "./Input.svelte";

  export let data: { [key: string]: any };
  let vms: Array<any> = [];

  $: if (data) vms = data.masters ? [data.masters[0], ...data.workers] : [data];

  // fields
  const nameField: IFormField = { label: "Name", symbol: "name", type: "text", disabled: true }; // prettier-ignore
  const publicIpField: IFormField = { label: "Public IP", symbol: "publicIP", type: "checkbox", disabled: true }; // prettier-ignore
  const yggIpField: IFormField = { label: "	Planetary Network IP", symbol: "yggIP", type: "text", disabled: true }; // prettier-ignore
  const networkField: IFormField = { label: "Network Name", symbol: "network", type: "text", disabled: true }; // prettier-ignore
  const cpuField: IFormField = { label: "CPU", symbol: "cpu", type: "number", disabled: true }; // prettier-ignore
  const memoryField: IFormField = { label: "Memory", symbol: "memory", type: "number", disabled: true }; // prettier-ignore
  // const diskField: IFormField = { label: "Disk", symbol: "size", type: "number", disabled: true }; // prettier-ignore
  const wireguardField: IFormField = { label: "WireGuard", symbol: "wireguard", type: "text", disabled: true }; // prettier-ignore
  const flistField: IFormField = { label: "Flist", symbol: "flist", type: "text", disabled: true }; // prettier-ignore
  // const domainField: IFormField = { label: "Domain", symbol: "domain", type: "text", disabled: true, tooltip: "Default Password: captain42" }; // prettier-ignore
</script>

{#each vms as vm, index}
  <Input data={vm.name} field={nameField} />
  <Input data={!!vm.publicIP} field={publicIpField} />
  {#if vm.planetary}
    <Input data={vm.yggIP} field={yggIpField} />
  {/if}
  <Input data={vm.interfaces[0].network} field={networkField} />
  <Input data={vm.capacity.cpu} field={cpuField} />
  <Input data={vm.capacity.memory} field={memoryField} />
  {#each vm.mounts as disk}
    <Input
      data={disk.size}
      field={{
        label: `Disk(${disk.mountPoint})`,
        symbol: "size",
        type: "number",
        disabled: true,
      }}
    />
  {/each}
  <Input data={vm.interfaces[0].ip} field={wireguardField} />
  {#if vm.flist}
    <Input data={vm.flist} field={flistField} />
  {/if}
  {#if vm.env.CAPROVER_ROOT_DOMAIN}
    <Input
      data={"http://captain." + vm.env.CAPROVER_ROOT_DOMAIN}
      field={{
        label: "Domain",
        symbol: "domain",
        type: "text",
        disabled: true,
        tooltip: `Default Password: ${
          vm.env.DEFAULT_PASSWORD ? vm.env.DEFAULT_PASSWORD : "captain42"
        }`,
      }}
    />
  {/if}
  {#if vm.env.PEERTUBE_WEBSERVER_HOSTNAME}
    <Input
      data={"https://" + vm.env.PEERTUBE_WEBSERVER_HOSTNAME}
      field={{
        label: "Domain",
        symbol: "domain",
        type: "text",
        disabled: true,
      }}
    />
  {/if}
    {#if vm.env.FUNKWHALE_HOSTNAME}
    <Input
      data={"https://" + vm.env.FUNKWHALE_HOSTNAME}
      field={{
        label: "Domain",
        symbol: "domain",
        type: "text",
        disabled: true,
      }}
    />
  {/if}
  {#if index + 1 !== vms.length}
    <hr />
  {/if}
{/each}
