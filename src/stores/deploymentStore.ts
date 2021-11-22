import { writable } from "svelte/store";

function createDeploymentStore() {
  const { subscribe, set, update } = writable(0);

  return {
    subscribe,
    set(x: number) {
      update((value) => {
        value = value + 1;
        return value;
      });
    },
  };
}

export default createDeploymentStore();
