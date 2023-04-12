<svelte:options tag="tf-deployedlist" />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { IProfile } from "../../types/Profile";
  import type { DeploymentTab, ITab } from "../../types";
  import DeployedList from "../../types/deployedList";
  import deleteDeployment from "../../utils/deleteDeployment";
  // components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Tabs from "../../components/Tabs.svelte";
  import Table from "../../components/Table.svelte";
  import Modal from "../../components/DeploymentModal.svelte";
  import Alert from "../../components/Alert.svelte";
  import { noActiveProfile } from "../../utils/message";
  import UpdateK8s from "../../components/UpdateK8s.svelte";
  import UpdateCapRover from "../../components/UpdateCapRover.svelte";
  import type { IAction } from "../../types/table-action";
  import DialogueMsg from "../../components/DialogueMsg.svelte";
  import getGrid from "../../utils/getGrid";
  import type { IStore } from "../../stores/currentDeployment";
  import type { GridClient } from "grid3_client";
  import getWireguardConfig from "../../utils/getWireguardConfig";
  type TabsType = IStore["type"];
  export let tab: TabsType = undefined;

  const tabs: DeploymentTab[] = [
    { label: "Full Virtual Machine", value: "Fullvm" },
    { label: "Micro Virtual Machine", value: "VM" },
    { label: "Kubernetes", value: "Kubernetes" },
    { label: "CapRover", value: "CapRover" },
    { label: "Peertube", value: "Peertube" },
    { label: "Funkwhale", value: "Funkwhale" },
    { label: "Mattermost", value: "Mattermost" },
    // { label: "Mastodon", value: "Mastodon" },
    { label: "Discourse", value: "Discourse" },
    { label: "Taiga", value: "Taiga" },
    { label: "Owncloud", value: "Owncloud" },
    { label: "Presearch", value: "Presearch" },
    { label: "Subsquid", value: "Subsquid" },
    { label: "Casperlabs", value: "Casperlabs" },
    { label: "Algorand", value: "Algorand" },
    //{ label: "TFhub Validator", value: "TFhubValidator" },
    { label: "Node Pilot", value: "NodePilot" },
    // { label: "QSFS Virtual Machine", value: "Qvm" },
    { label: "Umbrel", value: "Umbrel" },
    { label: "Wordpress", value: "Wordpress" },
  ];
  let grid: GridClient;
  let active: IStore["type"] = "Fullvm";
  $: active = tab || active;

  let loading = false;
  let configed = false;
  let list: DeployedList;
  const deployedStore = window.configs?.deploymentStore;
  let profile: IProfile;
  let message: string = null;
  let name: string = null;
  let opened = false;
  function get_solution_label(active: string) {
    return (
      tabs.find(item => {
        return item.value == active;
      })?.label ?? "Not Found!"
    );
  }

  function onConfigHandler() {
    configed = true;
    loading = true;
    DeployedList.init(profile)
      .then(_list => {
        list = _list;
      })
      .finally(() => (loading = false));
  }

  function _reloadTab() {
    const x = active;
    active = undefined;

    const y = tab;
    tab = undefined;
    requestAnimationFrame(() => {
      active = x;
      tab = y;
    });
  }

  let removing: string = null;
  function onRemoveHandler(key: "k8s" | "machines", name: string, type: IStore["type"]) {
    removing = name;
    window.configs.currentDeploymentStore.deploy("Deleting Deployment", name);
    return deleteDeployment(profile, key, name, type)
      .catch(err => {
        console.log("Error while removing", err);
        message = err.message || err;
      })
      .finally(() => {
        removing = null;
        window.configs.currentDeploymentStore.clear();
      });
  }

  let infoToShow: object;
  let k8sToUpdate: any;
  let capRoverToUpdate: any;

  let _sub: any;
  onMount(async () => {
    _sub = deployedStore.subscribe(() => {
      _reloadTab();
    });
    if (profile) {
      grid = await getGrid(profile, grid => grid, "");
    }
  });

  onDestroy(() => {
    _sub();
    list?.grid.disconnect();
  });

  function _createK8sRows(rows: any[]) {
    return rows.map((row, i) => {
      const { name, master, workers, consumption } = row;
      let publicIp = master.publicIP ?? ({} as any);
      master.publicIP ? (publicIp.ip = publicIp.ip.split("/")[0]) : (publicIp.ip = "None");
      master.publicIP ? (publicIp.ip6 = publicIp.ip6.split("/")[0]) : (publicIp.ip6 = "None");
      return [i + 1, name, publicIp.ip, publicIp.ip6, master.planetary, workers, consumption]; // prettier-ignore
    });
  }

  function _createVMRow(rows: any[]) {
    return rows.map((row, i) => {
      let { name, publicIp, publicIp6, planetary, flist, consumption } = row;
      const _flist =
        typeof flist === "string" ? flist.replace("https://hub.grid.tf/", "").replace(".flist", "") : flist;
      publicIp = publicIp != "None" ? publicIp.split("/")[0] : "None";
      publicIp6 = publicIp6 != "None" ? publicIp6.split("/")[0] : "None";
      return [i + 1, name, publicIp, publicIp6, planetary, _flist, consumption];
    });
  }

  let selectedRows: any[] = [];
  const _onSelectRowHandler = ({ detail }: { detail: number[] }) => selectedRows = detail; // prettier-ignore

  async function onDeleteHandler() {
    message = null;

    const key = active === "Kubernetes" ? "k8s" : "machines";
    for (const row of selectedRows) {
      await onRemoveHandler(key, row.name, active);
    }
    selectedRows = [];
    _reloadTab();
  }

  const _vmHeader = ["#", "Name", "Public IPv4", "Public IPv6", "Planetary Network IP", "Flist", "Billing Rate"];

  const actions: { [key in TabsType]?: (rows: any[]) => IAction[] } = new Proxy(
    {
      VM: rows => [
        {
          type: "info",
          label: "Show Details",
          click: async (_, i) => {
            const wireguard = await getWireguardConfig({ name: rows[i].details?.interfaces[0].network });
            if (wireguard) {
              rows[i].details.wireguard = wireguard[0];
            }
            infoToShow = rows[i].details;
          },
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
      ],
      CapRover: rows => [
        {
          type: "info",
          label: "Show Details",
          click: async (_, i) => {
            grid.clientOptions.projectName = active;
            grid._connect();
            infoToShow = await grid.machines.getObj(rows[i]["name"]);
          },
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Manage Workers",
          click: (_, i) => (capRoverToUpdate = rows[i]),
          disabled: () => removing !== null,
        },
        {
          type: "success",
          label: "Admin Panel",
          click: (_, i) => {
            const domain = rows[i].details.env.CAPROVER_ROOT_DOMAIN;
            window.open("http://captain." + domain, "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.CAPROVER_ROOT_DOMAIN || removing !== null;
          },
        },
      ],
      Peertube: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = rows[i].details.env.PEERTUBE_WEBSERVER_HOSTNAME;
            window.open("https://" + domain, "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.PEERTUBE_WEBSERVER_HOSTNAME || removing !== null;
          },
        },
      ],
      Funkwhale: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = rows[i].details.env.FUNKWHALE_HOSTNAME;
            window.open("https://" + domain, "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.FUNKWHALE_HOSTNAME || removing !== null;
          },
        },
      ],
      Taiga: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = rows[i].details.env.DOMAIN_NAME;
            window.open("https://" + domain, "_blank").focus();
          },
          disabled: i => {
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
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.DOMAIN_NAME || removing !== null;
          },
        },
      ],
      Mattermost: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = rows[i].details.env.SITE_URL;
            window.open(domain, "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.SITE_URL || removing !== null;
          },
        },
      ],
      Mastodon: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = "https://" + rows[i].details.env.LOCAL_DOMAIN;
            window.open(domain, "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.SITE_URL || removing !== null;
          },
        },
      ],
      TFhubValidator: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
      ],
      Discourse: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = rows[i].details.env.DISCOURSE_HOSTNAME;
            window.open("https://" + domain, "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.DISCOURSE_HOSTNAME || removing !== null;
          },
        },
      ],
      Casperlabs: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = rows[i].details.env.CASPERLABS_HOSTNAME;
            window.open("https://" + domain, "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.CASPERLABS_HOSTNAME || removing !== null;
          },
        },
      ],
      Owncloud: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = rows[i].details.env.OWNCLOUD_DOMAIN;
            window.open("https://" + domain, "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.OWNCLOUD_DOMAIN || removing !== null;
          },
        },
      ],
      Presearch: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
      ],
      Subsquid: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = rows[i].details.env.SUBSQUID_WEBSERVER_HOSTNAME;
            window.open("https://" + domain + "/graphql", "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.SUBSQUID_WEBSERVER_HOSTNAME || removing !== null;
          },
        },
      ],
      NodePilot: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = rows[i].details.publicIP.ip;
            window.open("https://" + domain.substr(0, domain.indexOf("/")), "_blank").focus();
          },
          disabled: i => {
            const publicIP = rows[i].details.publicIP;
            return !publicIP || !publicIP.ip || removing !== null;
          },
        },
      ],
      Fullvm: rows => [
        {
          type: "info",
          label: "Show Details",
          click: async (_, i) => {
            const wireguard = await getWireguardConfig({ name: rows[i].details?.interfaces[0].network });
            if (wireguard) {
              rows[i].details.wireguard = wireguard[0];
            }
            infoToShow = rows[i].details;
          },
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
      ],
      Qvm: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
      ],
      Algorand: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
      ],
      Umbrel: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Admin Panel",
          click: (_, i) => {
            if (rows[i].details.publicIP) {
              // remove prefix form ip address
              const domain = rows[i].details.publicIP.ip.slice(0, -3);
              window.open(`http://${domain}`, "_blank").focus();
            } else {
              const domain = rows[i].details.planetary;
              window.open(`http://[${domain}]`, "_blank").focus();
            }
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.WP_URL || removing !== null;
          },
        },
      ],
      Wordpress: rows => [
        {
          type: "info",
          label: "Show Details",
          click: (_, i) => (infoToShow = rows[i].details),
          disabled: () => removing !== null,
          loading: i => removing === rows[i].name,
        },
        {
          type: "warning",
          label: "Visit",
          click: (_, i) => {
            const domain = rows[i].details.env.WP_URL;
            window.open(domain, "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.WP_URL || removing !== null;
          },
        },
        {
          type: "success",
          label: "Admin Panel",
          click: (_, i) => {
            const domain = rows[i].details.env.WP_URL;
            window.open(domain + "/wp-admin", "_blank").focus();
          },
          disabled: i => {
            const env = rows[i].details.env;
            return !env || !env.DOMAIN_NAME || removing !== null;
          },
        },
      ],
    },
    {
      get(target, prop) {
        return prop in target ? target[prop] : () => [];
      },
    },
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
        <Tabs bind:active {tabs} disabled={removing !== null} on:select={() => (selectedRows = [])} />
      {/if}

      <div class="is-flex is-justify-content-space-between is-align-items-center mt-2 mb-2">
        <div style="width: 100%;">
          {#if message}
            <Alert type="danger" {message} />
          {/if}
        </div>
        <button
          class={"ml-2 button is-danger " + (removing ? "is-loading" : "")}
          style={`background-color: #FF5151; color: #fff`}
          disabled={selectedRows.length === 0 || removing !== null}
          on:select={() => (selectedRows = [])}
          on:click|preventDefault|stopPropagation={() => {
            name = selectedRows.map(({ name }) => name).join(", ");
            opened = !opened;
          }}
        >
          Delete
        </button>
      </div>
      <DialogueMsg bind:opened on:removed={onDeleteHandler} {name} />

      <!-- K8S -->
      {#if active === "Kubernetes"}
        {#await list.loadK8s()}
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
              headers={["#", "Name", "Public IPv4", "Public IPv6", "Planetary Network IP", "Workers", "Billing Rate"]}
              rows={_createK8sRows(rows.data)}
              actions={[
                {
                  type: "info",
                  label: "Show Details",
                  click: async (_, i) => {
                    const wireguard = await getWireguardConfig({
                      name: rows.data[i].details?.masters[0]?.interfaces[0].network,
                    });
                    if (wireguard) {
                      rows.data[i].details.wireguard = wireguard[0];
                    }
                    infoToShow = rows.data[i].details;
                  },
                  disabled: () => removing !== null,
                  loading: i => removing === rows.data[i].name,
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
          <Alert type="danger" message={err.message || err || "Failed to list Kubernetes"} />
        {/await}
      {:else}
        {#await list?.loadDeployments(active)}
          <Alert
            type="info"
            message={`Listing ${active == "Casperlabs" ? "Casperlab" : get_solution_label(active)}s...`}
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
                active == "Casperlabs" ? "Casperlab" : get_solution_label(active)
              }s found on this profile.`}
            />
          {/if}
        {:catch err}
          <Alert
            type="danger"
            message={err.message ||
              err ||
              `Failed to list ${active == "Casperlabs" ? "Casperlab" : get_solution_label(active)}s`}
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

{#if capRoverToUpdate}
  <UpdateCapRover
    {profile}
    capRover={capRoverToUpdate}
    on:closed={({ detail }) => {
      capRoverToUpdate = null;
      if (detail) _reloadTab();
    }}
  />
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
