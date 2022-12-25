import { writable } from "svelte/store";

function createDeploymentStore() {
  const { subscribe, update } = writable(0);

  return {
    subscribe,
    set() {
      update(value => {
        value = value + 1;
        return value;
      });
    },
  };
}

export default createDeploymentStore();
