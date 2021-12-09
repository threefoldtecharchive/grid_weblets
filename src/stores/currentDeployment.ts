import { writable } from "svelte/store";

interface IStore {
  type: "Kubernetes" | "VM" | "CapRover" | "Peertube" | "Funkwhale";
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
