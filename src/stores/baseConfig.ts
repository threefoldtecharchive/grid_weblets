import { /*  get, */ writable } from "svelte/store";

function createBaseConfig() {
  const store = writable({ mnemonics: "", storeSecret: "", networkEnv: "dev" });
  const { subscribe, set, update } = store;
  return {
    subscribe,
    set,
    update,
    // get valid(): boolean {
    //   const { mnemonics, storeSecret } = get(store);
    //   return mnemonics !== "" && storeSecret !== "";
    // },
  };
}

export default createBaseConfig();
