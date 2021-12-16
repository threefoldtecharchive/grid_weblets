import { writable } from "svelte/store";

export interface IStore {
  type:
    | "Kubernetes"
    | "VM"
    | "CapRover"
    | "Peertube"
    | "Funkwhale"
    | "GatewayName";
  name: string;
}

function createCurrentDeploymentStore() {
  const { subscribe, set } = writable<IStore>(null);

  return {
    subscribe,
    deploy: (type: IStore["type"], name: IStore["name"]) => set({ type, name }),
    clear: () => set(null),
  };
}

export default createCurrentDeploymentStore();
