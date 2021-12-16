<svelte:options tag="tf-deployedlist" />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { IProfile } from "../../types/Profile";
  import type { ITab } from "../../types";
  import DeployedList from "../../types/deployedList";
  import deleteContracts from "../../utils/deleteContracts";

  type TabsType = "k8s" | "vm" | "caprover" | "funkwhale" | "peertube";
  export let tab: TabsType = undefined;

  // components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import Table from "../../components/Table.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import Alert from "../../components/Alert.svelte";

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Kubernetes", value: "k8s" },
    { label: "Virtual Machines", value: "vm" },
    { label: "Caprover", value: "caprover" },
    { label: "FunkWhale", value: "funkwhale" },
    { label: "Peertube", value: "peertube" }
  ];
  let active: string = "k8s";
  $: active = tab || active;

  let loading = false;
  let configed = false;
  let list: DeployedList;
  const deployedStore = window.configs?.deploymentStore;

  let profile: IProfile;

  function onConfigHandler() {
    configed = true;
    loading = true;
    DeployedList.init(profile)
      .then((_list) => {
        list = _list;
      })
      .finally(() => (loading = false));
  }

  function _reloadTab() {
    const x = active;
    active = "";

    const y = tab;
    tab = undefined;
    requestAnimationFrame(() => {
      active = x;
      tab = y;
    });
  }

  let removing: string = null;
  function onRemoveHandler(key: "k8s" | "machines", name: string) {
    removing = name;
    return deleteContracts(profile, key, name)
      .then((data) => {
        console.log("Removed", data);
      })
      .catch((err) => {
        console.log("Error while removing", err);
      })
      .finally(() => (removing = null));
  }

  let infoToShow: Object;

  let _sub: any;
  onMount(() => {
    _sub = deployedStore.subscribe(() => {
      _reloadTab();
    });
  });

  onDestroy(() => {
    _sub();
    list?.grid.disconnect();
  });

  function _createK8sRows(rows: any[]) {
    return rows.map((row, i) => {
      const { name, master, workers } = row;
      return [i + 1, name, master.publicIP?.ip ?? "", master.planetary ?? "", workers]; // prettier-ignore
    });
  }

  function _createVMRow(rows: any[]) {
    return rows.map((row, i) => {
      const { name, publicIp, planetary, flist } = row;
      return [i + 1, name, publicIp ?? "", planetary ?? "", flist];
    });
  }

  let selectedRows: any[] = [];
  const _onSelectRowHandler = ({ detail }: { detail: number[] }) => selectedRows = detail; // prettier-ignore

  async function onDeleteHandler() {
    const names = selectedRows.map(({ name }) => name).join(", ");
    const remove = window.confirm(`Are you sure u want to delete '${names}'?`);
    if (!remove) return;

    const key = active === "k8s" ? "k8s" : "machines";
    for (const row of selectedRows) {
      await onRemoveHandler(key, row.name);
    }
    selectedRows = [];
    _reloadTab();
  }
</script>

<SelectProfile
  on:profile={({ detail }) => {
    profile = detail;
    if (detail) {
      onConfigHandler();
    }
  }}
/>

<div style="padding: 15px;">
  <section class="box">
    <h4 class="is-size-4 mb-4">
      Deployment List {tab ? `(${tab})` : ""}
    </h4>
    <hr />

    {#if loading}
      <Alert type="info" message="Loading..." />
    {:else if !configed}
      <Alert
        type="info"
        message="Please activate a profile from profile manager"
      />
    {:else}
      {#if !tab}
        <Tabs
          bind:active
          {tabs}
          disabled={removing !== null}
          on:select={() => (selectedRows = [])}
        />
      {/if}

      <div class="is-flex is-justify-content-flex-end mt-2 mb-2">
        <button
          class={"button is-danger " + (removing ? "is-loading" : "")}
          disabled={selectedRows.length === 0 || removing !== null}
          on:click={onDeleteHandler}
        >
          Delete
        </button>
      </div>

      <!-- K8S -->
      {#if active === "k8s"}
        {#await list.loadK8s()}
          <Alert type="info" message="Loading Kubernetes..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={[
                "#",
                "Name",
                "Public IP",
                "Planetary Network IP",
                "Workers",
              ]}
              rows={_createK8sRows(rows)}
              actions={[
                {
                  type: "info",
                  label: "Show Details",
                  click: (_, i) => (infoToShow = rows[i].details),
                  disabled: () => removing !== null,
                  loading: (i) => removing === rows[i].name,
                },
              ]}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert type="info" message="No Kubernetes found on this profile." />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list Kubernetes"}
          />
        {/await}

        <!-- VM -->
      {:else if active === "vm"}
        {#await list.loadVm()}
          <Alert type="info" message="Loading Virtual Machines..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={[
                "#",
                "Name",
                "Public IP",
                "Planetary Network IP",
                "Flist",
              ]}
              rows={_createVMRow(rows)}
              actions={[
                {
                  type: "info",
                  label: "Show Details",
                  click: (_, i) => (infoToShow = rows[i].details),
                  disabled: () => removing !== null,
                  loading: (i) => removing === rows[i].name,
                },
              ]}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert type="info" message="No VMs found on this profile." />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list VMs"}
          />
        {/await}

        <!-- Caprover -->
      {:else if active === "caprover"}
        {#await list.loadCaprover()}
          <Alert type="info" message="Loading CapRover..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={[
                "#",
                "Name",
                "Public IP",
                "Planetary Network IP",
                "Flist",
              ]}
              rows={_createVMRow(rows)}
              actions={[
                {
                  type: "info",
                  label: "Show Details",
                  click: (_, i) => (infoToShow = rows[i].details),
                  disabled: () => removing !== null,
                  loading: (i) => removing === rows[i].name,
                },
                {
                  type: "warning",
                  label: "Admin Panel",
                  click: (_, i) => {
                    const domain = rows[i].details.env.CAPROVER_ROOT_DOMAIN;
                    window.open("http://captain." + domain, "_blank").focus();
                  },
                  disabled: (i) => {
                    const env = rows[i].details.env;
                    return (
                      !env || !env.CAPROVER_ROOT_DOMAIN || removing !== null
                    );
                  },
                },
              ]}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert type="info" message="No CapRovers found on this profile." />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list CapRover"}
          />
        {/await}

        <!-- Peertube -->
      {:else if active === "peertube"}
        {#await list.loadPeertube()}
          <Alert type="info" message="Loading Peertube..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={[
                "#",
                "Name",
                "Public IP",
                "Planetary Network IP",
                "Flist",
              ]}
              rows={_createVMRow(rows)}
              actions={[
                {
                  type: "info",
                  label: "Show Details",
                  click: (_, i) => (infoToShow = rows[i].details),
                  disabled: () => removing !== null,
                  loading: (i) => removing === rows[i].name,
                },
                {
                  type: "warning",
                  label: "Visit",
                  click: (_, i) => {
                    const domain =
                      rows[i].details.env.PEERTUBE_WEBSERVER_HOSTNAME;
                    window.open("https://" + domain, "_blank").focus();
                  },
                  disabled: (i) => {
                    const env = rows[i].details.env;
                    return (
                      !env ||
                      !env.PEERTUBE_WEBSERVER_HOSTNAME ||
                      removing !== null
                    );
                  },
                },
              ]}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert type="info" message="No Peertubes found on this profile." />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list Peertube"}
          />
        {/await}

        <!-- FunkWhale -->
      {:else if active === "funkwhale"}
        {#await list.loadFunkwhale()}
          <Alert type="info" message="Loading Funkwhale..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={[
                "#",
                "Name",
                "Public IP",
                "Planetary Network IP",
                "Flist",
              ]}
              rows={_createVMRow(rows)}
              actions={[
                {
                  type: "info",
                  label: "Show Details",
                  click: (_, i) => (infoToShow = rows[i].details),
                  disabled: () => removing !== null,
                  loading: (i) => removing === rows[i].name,
                },
                {
                  type: "warning",
                  label: "Visit",
                  click: (_, i) => {
                    const domain = rows[i].details.env.FUNKWHALE_HOSTNAME;
                    window.open("https://" + domain, "_blank").focus();
                  },
                  disabled: (i) => {
                    const env = rows[i].details.env;
                    return !env || !env.FUNKWHALE_HOSTNAME || removing !== null;
                  },
                },
              ]}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert type="info" message="No Funkwhale found on this profile." />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list Funkwhale"}
          />
        {/await}
      {/if}
    {/if}
  </section>
</div>

{#if infoToShow}
  <Modal data={infoToShow} on:closed={() => (infoToShow = null)} />
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
