import { writable } from "svelte/store";

export interface IStore {
  type:
    | "Kubernetes"
    | "Machines"
    | "VM"
    | "CapRover"
    | "Discourse"
    | "Peertube"
    | "Funkwhale"
    | "GatewayName"
    | "Add Worker"
    | "Remove Worker"
    | "Deleting Deployment"
    | "Taiga"
    | "Owncloud"
    | "Presearch"
    | "Subsquid"
    | "Mattermost"
    | "Mastodon"
    | "TFhubValidator"
    | "Casperlabs"
    | "NodePilot"
    | "Fullvm"
    | "Algorand"
    | "Qvm"
    | "QSFS"
    | "Umbrel"
    | "Wordpress";
  name: string;
  message: string;
}

function createCurrentDeploymentStore() {
  const { subscribe, set, update } = writable<IStore>(null);

  const _onLogMessage = (msg: string) => {
    if (typeof msg === "string") {
      update(value => {
        value.message = msg;
        return value;
      });
    }
  };

  return {
    subscribe,
    deploy: (type: IStore["type"], name: IStore["name"]) => {
      set({ type, name, message: null });

      /* connect stream logs */
      window.configs.grid3_client.events.addListener("logs", _onLogMessage);
    },
    clear: () => {
      set(null);

      /* remove connection from stream logs */
      window.configs.grid3_client.events.removeListener("logs", _onLogMessage);
    },
  };
}

export default createCurrentDeploymentStore();
