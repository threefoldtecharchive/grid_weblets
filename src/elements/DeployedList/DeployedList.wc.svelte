<svelte:options tag="tf-deployedlist" />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { IProfile } from "../../types/Profile";
  import type { ITab } from "../../types";
  import DeployedList from "../../types/deployedList";
  import deleteDeployment from "../../utils/deleteDeployment";

  type TabsType =
    | "k8s"
    | "vm"
    | "caprover"
    | "funkwhale"
    | "peertube"
    | "mattermost"
    | "tfhubValidator"
    | "discourse"
    | "taiga"
    | "owncloud"
    | "presearch"
    | "casperlabs"
    | "nodepilot"
    | "fullvm";

  export let tab: TabsType = undefined;

  // components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import Table from "../../components/Table.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import Alert from "../../components/Alert.svelte";
  import { noActiveProfile } from "../../utils/message";
  import UpdateK8s from "../../components/UpdateK8s.svelte";
  import type { IAction } from "../../types/table-action";

  // prettier-ignore
  const tabs: ITab[] = [
    { label: "Virtual Machine", value: "vm" },
    { label: "Kubernetes", value: "k8s" },
    { label: "CapRover", value: "caprover" },
    { label: "Peertube", value: "peertube" },
    { label: "Funkwhale", value: "funkwhale" },
    { label: "Mattermost", value: "mattermost" },
    { label: "Discourse", value: "discourse" },
    { label: "Taiga", value: "taiga" },
    { label: "Owncloud", value: "owncloud" },
    { label: "Presearch", value: "presearch" },
    { label: "Casperlabs", value: "casperlabs" },
    //{ label: "TFhub Validator", value: "tfhubValidator" },
    { label: "Node Pilot", value: "nodepilot" },
    { label: "Full Virtual Machine", value: "fullvm" },
  ];
  let active: string = "vm";
  $: active = tab || active;

  let loading = false;
  let configed = false;
  let list: DeployedList;
  const deployedStore = window.configs?.deploymentStore;

  let profile: IProfile;
  let message: string = null;

  function get_solution_label(active: string) {
    return (
      tabs.find((item) => {
        return item.value == active;
      })?.label ?? "Not Found!"
    );
  }

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
    return deleteDeployment(profile, key, name, type)
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
      const _flist =
        typeof flist === "string"
          ? flist.replace("https://hub.grid.tf/", "").replace(".flist", "")
          : flist;
      return [i + 1, name, publicIp, publicIp6, planetary, _flist, consumption];
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
      await onRemoveHandler(key, row.name, active);
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

  const actions: { [key in TabsType]?: (rows: any[]) => IAction[] } = new Proxy(
    {
      vm: (rows) => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: (i) => removing === rows[i].name,
        },
      ],
      caprover: (rows) => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: (i) => removing === rows[i].name,
        },
        {
          type: "success",
          label: "Admin Panel",
          click: (_, i) => {
            const domain = rows[i].details.env.CAPROVER_ROOT_DOMAIN;
            window.open("http://captain." + domain, "_blank").focus();
          },
          disabled: (i) => {
            const env = rows[i].details.env;
            return !env || !env.CAPROVER_ROOT_DOMAIN || removing !== null;
          },
        },
      ],
      peertube: (rows) => [
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
            const domain = rows[i].details.env.PEERTUBE_WEBSERVER_HOSTNAME;
            window.open("https://" + domain, "_blank").focus();
          },
          disabled: (i) => {
            const env = rows[i].details.env;
            return (
              !env || !env.PEERTUBE_WEBSERVER_HOSTNAME || removing !== null
            );
          },
        },
      ],
      funkwhale: (rows) => [
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
      ],
      taiga: (rows) => [
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
          type: "success",
          label: "Admin Panel",
          click: (_, i) => {
            const domain = rows[i].details.env.DOMAIN_NAME;
            window.open("http://" + domain + "/admin/", "_blank").focus();
          },
          disabled: (i) => {
            const env = rows[i].details.env;
            return !env || !env.DOMAIN_NAME || removing !== null;
          },
        },
      ],
      mattermost: (rows) => [
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
      ],
      tfhubValidator: (rows) => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: (i) => removing === rows[i].name,
        },
      ],
      discourse: (rows) => [
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
      ],
      casperlabs: (rows) => [
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
            const domain = rows[i].details.env.CASPERLABS_HOSTNAME;
            window.open("https://" + domain, "_blank").focus();
          },
          disabled: (i) => {
            const env = rows[i].details.env;
            return !env || !env.CASPERLABS_HOSTNAME || removing !== null;
          },
        },
      ],
      owncloud: (rows) => [
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
      ],
      presearch: (rows) => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: (i) => removing === rows[i].name,
        },
      ],
      nodepilot: (rows) => [
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
            const domain = rows[i].details.publicIP.ip;
            window
              .open(
                "https://" + domain.substr(0, domain.indexOf("/")),
                "_blank"
              )
              .focus();
          },
          disabled: (i) => {
            const publicIP = rows[i].details.publicIP;
            return !publicIP || !publicIP.ip || removing !== null;
          },
        },
      ],
      fullvm: (rows) => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: (i) => removing === rows[i].name,
        },
      ],
    },
    {
      get(target, prop) {
        return prop in target ? target[prop] : () => [];
      },
    }
  );
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
      Deployment List {tab ? `(${get_solution_label(tab)})` : ""}
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
          style={`background-color: #FF5151; color: #fff`}
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
          {#if rows.data.length}
            {#if rows.data.length !== rows.total}
              <Alert
                type="warning"
                message={`
                Failed to load 
                <strong>${rows.total - rows.data.length}</strong> 
                out of ${rows.total} Deployments`}
              />
            {/if}
            <Table
              rowsData={rows.data}
              headers={[
                "#",
                "Name",
                "Public IPv4",
                "Public IPv6",
                "Planetary Network IP",
                "Workers",
                "Billing Rate",
              ]}
              rows={_createK8sRows(rows.data)}
              actions={[
                {
                  type: "info",
                  label: "Show Details",
                  click: (_, i) => (infoToShow = rows.data[i].details),
                  disabled: () => removing !== null,
                  loading: (i) => removing === rows.data[i].name,
                },
                {
                  type: "warning",
                  label: "Manage Workers",
                  click: (_, i) => (k8sToUpdate = rows.data[i]),
                  disabled: () => removing !== null,
                },
              ]}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert type="gray" message="No Kubernetes found on this profile." />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message || err || "Failed to list Kubernetes"}
          />
        {/await}
      {:else}
        {#await list?.loadDeployments(active === "vm" ? undefined : active)}
          <Alert
            type="info"
            message={`Listing ${
              active == "casperlabs" ? "Casperlab" : get_solution_label(active)
            }s...`}
          />
        {:then rows}
          {#if rows.data.length}
            {#if rows.data.length !== rows.total}
              <Alert
                type="warning"
                message={`
                Failed to load 
                <strong>${rows.total - rows.data.length}</strong> 
                out of ${rows.total} Deployments`}
              />
            {/if}
            <Table
              rowsData={rows.data}
              headers={_vmHeader}
              rows={_createVMRow(rows.data)}
              actions={actions[active](rows.data)}
              on:selected={_onSelectRowHandler}
            />
          {:else}
            <Alert
              type="gray"
              message={`No ${
                active == "casperlabs"
                  ? "Casperlab"
                  : get_solution_label(active)
              }s found on this profile.`}
            />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message ||
              err ||
              `Failed to list ${
                active == "casperlabs"
                  ? "Casperlab"
                  : get_solution_label(active)
              }s`}
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
