<svelte:options tag="tf-deployedlist" />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { IProfile } from "../../types/Profile";
  import type { ITab } from "../../types";
  import DeployedList from "../../types/deployedList";
  import deleteContracts from "../../utils/deleteContracts";

  type TabsType =
    | "k8s"
    | "vm"
    | "caprover"
    | "funkwhale"
    | "peertube"
    | "mattermost"
    | "discourse"
    | "taiga"
    | "owncloud"
    | "presearch";
  export let tab: TabsType = undefined;

  // components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import Table from "../../components/Table.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import Alert from "../../components/Alert.svelte";
  import { noActiveProfile } from "../../utils/message";
  import UpdateK8s from "../../components/UpdateK8s.svelte";

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Kubernetes", value: "k8s" },
    { label: "Virtual Machines", value: "vm" },
    { label: "Caprover", value: "caprover" },
    { label: "FunkWhale", value: "funkwhale" },
    { label: "Peertube", value: "peertube" },
    { label: "Mattermost", value: "mattermost" },
    { label: "Discourse", value: "discourse" },
    { label: "Taiga", value: "taiga" },
    { label: "Owncloud", value: "owncloud" },
    { label: "Presearch", value: "presearch" }

  ];
  let active: string = "k8s";
  $: active = tab || active;

  let loading = false;
  let configed = false;
  let list: DeployedList;
  const deployedStore = window.configs?.deploymentStore;

  let profile: IProfile;
  let message: string = null;

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
  function onRemoveHandler(
    key: "k8s" | "machines",
    name: string,
    type: string
  ) {
    removing = name;
    window.configs.currentDeploymentStore.deploy("Deleting Deployment", name);
    return deleteContracts(profile, key, name, type)
      .catch((err) => {
        console.log("Error while removing", err);
        message = err.message || err;
      })
      .finally(() => {
        removing = null;
        window.configs.currentDeploymentStore.clear();
      });
  }

  let infoToShow: Object;
  let k8sToUpdate: any;

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
      const { name, master, workers, consumption } = row;
      const publicIp = master.publicIP ?? ({} as any);
      return [i + 1, name, publicIp.ip || "None", publicIp.ip6 || "None", master.planetary || "None", workers, consumption]; // prettier-ignore
    });
  }

  function _createVMRow(rows: any[]) {
    return rows.map((row, i) => {
      const { name, publicIp, publicIp6, planetary, flist, consumption } = row;
      return [i + 1, name, publicIp, publicIp6, planetary, flist, consumption];
    });
  }

  let selectedRows: any[] = [];
  const _onSelectRowHandler = ({ detail }: { detail: number[] }) => selectedRows = detail; // prettier-ignore

  async function onDeleteHandler() {
    message = null;
    const names = selectedRows.map(({ name }) => name).join(", ");
    const remove = window.confirm(
      `Are you sure you want to delete '${names}'?`
    );
    if (!remove) return;

    const key = active === "k8s" ? "k8s" : "machines";
    for (const row of selectedRows) {
      // format the value of the tab to match the project name on the gridclient
      let projectName = active[0].toUpperCase() + active.slice(1);
      await onRemoveHandler(key, row.name, projectName);
    }
    selectedRows = [];
    _reloadTab();
  }

  const _vmHeader = [
    "#",
    "Name",
    "Public IPv4",
    "Public IPv6",
    "Planetary Network IP",
    "Flist",
    "Billing Rate",
  ];
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
    {:else if !configed || !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if !list}
      <Alert type="info" message="Initializing..." />
    {:else}
      {#if !tab}
        <Tabs
          bind:active
          {tabs}
          disabled={removing !== null}
          on:select={() => (selectedRows = [])}
        />
      {/if}

      <div
        class="is-flex is-justify-content-space-between is-align-items-center mt-2 mb-2"
      >
        <div style="width: 100%;">
          {#if message}
            <Alert type="danger" {message} />
          {/if}
        </div>
        <button
          class={"ml-2 button is-danger " + (removing ? "is-loading" : "")}
          disabled={selectedRows.length === 0 || removing !== null}
          on:click={onDeleteHandler}
        >
          Delete
        </button>
      </div>

      <!-- K8S -->
      {#if active === "k8s"}
        {#await list?.loadK8s()}
          <Alert type="info" message="Listing Kubernetes..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={[
                "#",
                "Name",
                "Public IPv4",
                "Public IPv6",
                "Planetary Network IP",
                "Workers",
                "Billing Rate",
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
                {
                  type: "warning",
                  label: "Manage Workers",
                  click: (_, i) => (k8sToUpdate = rows[i]),
                  disabled: () => removing !== null,
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
        {#await list?.loadVm()}
          <Alert type="info" message="Listing Virtual Machines..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={_vmHeader}
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
        {#await list?.loadDeployments("CapRover", "caprover")}
          <Alert type="info" message="Listing CapRover..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={_vmHeader}
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
        {#await list?.loadDeployments("Peertube", "peertube")}
          <Alert type="info" message="Listing Peertube..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={_vmHeader}
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
        {#await list?.loadDeployments("Funkwhale", "funk")}
          <Alert type="info" message="Listing Funkwhale..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={_vmHeader}
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
            <Alert type="info" message="No Funkwhales found on this profile." />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list Funkwhale"}
          />
        {/await}

        <!-- Taiga -->
      {:else if active === "taiga"}
        {#await list.loadDeployments("Taiga", "taiga")}
          <Alert type="info" message="Listing Taiga Instances..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={_vmHeader}
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
                    const domain = rows[i].details.env.DOMAIN_NAME;
                    window.open("https://" + domain, "_blank").focus();
                  },
                  disabled: (i) => {
                    const env = rows[i].details.env;
                    return !env || !env.DOMAIN_NAME || removing !== null;
                  },
                },
                {
                  type: "warning",
                  label: "Admin Panel",
                  click: (_, i) => {
                    const domain = rows[i].details.env.DOMAIN_NAME;
                    window
                      .open("http://" + domain + "/admin/", "_blank")
                      .focus();
                  },
                  disabled: (i) => {
                    const env = rows[i].details.env;
                    return !env || !env.DOMAIN_NAME || removing !== null;
                  },
                },
              ]}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert
              type="info"
              message="No Taiga instances found on this profile."
            />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list Taiga instances"}
          />
        {/await}

        <!-- Mattermost -->
      {:else if active === "mattermost"}
        {#await list?.loadDeployments("Mattermost", "mattermost")}
          <Alert type="info" message="Listing Mattermost..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={_vmHeader}
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
                    const domain = rows[i].details.env.SITE_URL;
                    window.open(domain, "_blank").focus();
                  },
                  disabled: (i) => {
                    const env = rows[i].details.env;
                    return !env || !env.SITE_URL || removing !== null;
                  },
                },
              ]}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert type="info" message="No Mattermost found on this profile." />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list Mattermost"}
          />
        {/await}

        <!-- Discourse -->
      {:else if active === "discourse"}
        {#await list?.loadDeployments("Discourse", "discourse")}
          <Alert type="info" message="Listing Discourse..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={_vmHeader}
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
                    const domain = rows[i].details.env.DISCOURSE_HOSTNAME;
                    window.open("https://" + domain, "_blank").focus();
                  },
                  disabled: (i) => {
                    const env = rows[i].details.env;
                    return !env || !env.DISCOURSE_HOSTNAME || removing !== null;
                  },
                },
              ]}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert type="info" message="No Discourses found on this profile." />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list Discourse"}
          />
        {/await}

        <!-- Owncloud -->
      {:else if active === "owncloud"}
        {#await list.loadDeployments("Owncloud", "owncloud")}
          <Alert type="info" message="Listing owncloud Instances..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={_vmHeader}
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
                    const domain = rows[i].details.env.OWNCLOUD_DOMAIN;
                    window.open("https://" + domain, "_blank").focus();
                  },
                  disabled: (i) => {
                    const env = rows[i].details.env;
                    return !env || !env.OWNCLOUD_DOMAIN || removing !== null;
                  },
                },
              ]}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert
              type="info"
              message="No owncloud instances found on this profile."
            />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list owncloud instances"}
          />
        {/await}

        <!-- Presearch -->
      {:else if active === "presearch"}
        {#await list.loadDeployments("Presearch", "presearch")}
          <Alert type="info" message="Listing presearch Instances..." />
        {:then rows}
          {#if rows.length}
            <Table
              rowsData={rows}
              headers={_vmHeader}
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
            <Alert
              type="info"
              message="No presearch instances found on this profile."
            />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list presearch instances"}
          />
        {/await}
      {/if}
    {/if}
  </section>
</div>

{#if infoToShow}
  <Modal data={infoToShow} on:closed={() => (infoToShow = null)} />
{/if}

{#if k8sToUpdate}
  <UpdateK8s
    {profile}
    k8s={k8sToUpdate}
    on:closed={({ detail }) => {
      k8sToUpdate = null;
      if (detail) _reloadTab();
    }}
  />
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
