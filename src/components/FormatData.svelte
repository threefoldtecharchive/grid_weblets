<svelte:options tag="tf-format-data" />

<script lang="ts">
  import type { IFormField } from "../types";
  import Input from "./Input.svelte";

  export let vm: any;

  // fields
  const nameField: IFormField = { label: "Name", symbol: "name", type: "text", disabled: true }; // prettier-ignore
  const yggIpField: IFormField = { label: "	Planetary Network IP", symbol: "planetary", type: "text", disabled: true }; // prettier-ignore
  const networkField: IFormField = { label: "Network Name", symbol: "network", type: "text", disabled: true }; // prettier-ignore
  const cpuField: IFormField = { label: "CPU", symbol: "cpu", type: "number", disabled: true }; // prettier-ignore
  const memoryField: IFormField = { label: "Memory", symbol: "memory", type: "number", disabled: true }; // prettier-ignore
  const wireguardField: IFormField = { label: "WireGuard IP", symbol: "wireguardIP", type: "text", disabled: true }; // prettier-ignore
  const wireguardConfigField: IFormField = { label: "WireGuard Config", symbol: "wireguardConfig", type: "textarea",class:"config", disabled: true }; // prettier-ignore
  const flistField: IFormField = { label: "Flist", symbol: "flist", type: "text", disabled: true }; // prettier-ignore
  const contractIdField: IFormField = { label: "Contract ID", symbol: "contractId", type: "number", disabled: true }; // prettier-ignore
</script>

{#if vm}
  {#if vm.contractId}
    <Input data={vm.contractId} field={contractIdField} />
  {/if}
  <Input data={vm.name} field={nameField} />

  {#if !!vm.publicIP}
    {#if !!vm.publicIP.ip}
      <Input
        data={vm.publicIP.ip}
        field={{
          label: "Public IPv4",
          symbol: "publicIP",
          type: "text",
          disabled: true,
        }}
      />
    {/if}

    {#if !!vm.publicIP.ip6}
      <Input
        data={vm.publicIP.ip6}
        field={{
          label: "Public IPv6",
          symbol: "publicIP6",
          type: "text",
          disabled: true,
        }}
      />
    {/if}
  {:else}
    <Input
      data={false}
      field={{
        label: "Public IP",
        symbol: "publicIP",
        type: "checkbox",
        disabled: true,
      }}
    />
  {/if}

  {#if vm.planetary}
    <Input data={vm.planetary} field={yggIpField} />
  {/if}
  <Input data={vm.interfaces[0].network} field={networkField} />
  <Input data={vm.capacity.cpu} field={cpuField} />
  <Input data={vm.capacity.memory} field={memoryField} />
  {#each vm.mounts as disk}
    <Input
      data={Math.ceil(disk.size / (1024 * 1024 * 1024))}
      field={{
        label: `Disk(${disk.mountPoint}) GB`,
        symbol: "size",
        type: "number",
        disabled: true,
      }}
    />
  {/each}
  <Input data={vm.interfaces[0].ip} field={wireguardField} />
  {#if vm.wireguard}
    <Input data={vm.wireguard} field={wireguardConfigField} />
  {/if}

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
        tooltip: `Default Password: ${vm.env.DEFAULT_PASSWORD ? vm.env.DEFAULT_PASSWORD : "captain42"}`,
      }}
    />
  {/if}
  {#if vm.env.DISCOURSE_HOSTNAME}
    <Input
      data={"https://" + vm.env.DISCOURSE_HOSTNAME}
      field={{
        label: "Domain",
        symbol: "domain",
        type: "text",
        disabled: true,
      }}
    />
  {/if}
  {#if vm.env.SUBSQUID_WEBSERVER_HOSTNAME}
    <Input
      data={"https://" + vm.env.SUBSQUID_WEBSERVER_HOSTNAME}
      field={{
        label: "Domain",
        symbol: "domain",
        type: "text",
        disabled: true,
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
  {#if vm.env.OWNCLOUD_DOMAIN}
    <Input
      data={"https://" + vm.env.OWNCLOUD_DOMAIN}
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
  {#if vm.env.MATTERMOST_DOMAIN}
    <Input
      data={"https://" + vm.env.MATTERMOST_DOMAIN}
      field={{
        label: "Domain",
        symbol: "domain",
        type: "text",
        disabled: true,
      }}
    />
  {/if}
  <!-- umbrel data  -->
  {#if vm.env.UMBREL_DISK}
    <Input
      data={vm.env.USERNAME}
      field={{
        label: "Username",
        symbol: "username",
        type: "text",
        disabled: true,
      }}
    />
    <Input
      data={vm.env.PASSWORD}
      field={{
        label: "Password",
        symbol: "password",
        type: "text",
        disabled: true,
      }}
    />
  {/if}
  <!-- wordpress data  -->
  {#if vm.env.WP_URL}
    <Input
      data={vm.env.WP_URL}
      field={{
        label: "Domain",
        symbol: "domain",
        type: "text",
        disabled: true,
      }}
    />
  {/if}
  {#if vm.env.MYSQL_USER && vm.env.MYSQL_PASSWORD}
    <Input
      data={vm.env.MYSQL_USER}
      field={{
        label: "Username",
        symbol: "username",
        type: "text",
        disabled: true,
      }}
    />
    <Input
      data={vm.env.MYSQL_PASSWORD}
      field={{
        label: "Password",
        symbol: "password",
        type: "text",
        disabled: true,
      }}
    />
  {/if}
{/if}

<style>
  .config {
    white-space: pre-wrap;
  }
</style>
