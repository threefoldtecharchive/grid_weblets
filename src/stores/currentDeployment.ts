import { writable } from "svelte/store";
import type { IStore } from "../types/istore";

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
export { IStore };
