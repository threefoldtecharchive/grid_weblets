import { get, writable } from "svelte/store";
import { enc } from "crypto-js";
import { encrypt, decrypt } from "crypto-js/aes";

function createBaseConfig() {
  const store = writable({
    mnemonics: "",
    storeSecret: "",
    networkEnv: "dev",
    loaded: false,
  });

  const { subscribe, set, update } = store;
  return {
    subscribe,
    set,
    update,
    load() {
      const password = get(store).storeSecret;
      let data = localStorage.getItem("BASE_CONFIGS");

      update((v) => {
        try {
          if (data) {
            v = {
              ...v,
              ...JSON.parse(decrypt(data, password).toString(enc.Utf8)),
            };
          }
          v.loaded = true;
        } catch {}
        return v;
      });
    },
    save() {
      const password = get(store).storeSecret;
      localStorage.setItem(
        "BASE_CONFIGS",
        encrypt(JSON.stringify(get(store)), password).toString()
      );
    },
  };
}

export default createBaseConfig();
