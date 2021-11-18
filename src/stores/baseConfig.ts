import { get, writable } from "svelte/store";
import { enc } from "crypto-js";
import { encrypt, decrypt } from "crypto-js/aes";

const KEY = "BASE_CONFIGS";
const createProfile = (name = "", m = "", s = "", n = "dev") => ({ name, mnemonics: m, storeSecret: s, networkEnv: n }); // prettier-ignore

function createBaseConfig() {
  const store = writable([createProfile("Profile 1")]);

  const { subscribe, set, update } = store;
  return {
    subscribe,
    set,
    update,
    updateMnemonics(idx: number, e: InputEvent) {
      return update((value) => {
        value[idx].mnemonics = (e.target as any).value;
        return value;
      });
    },
    updateStoreSecret(idx: number, e: InputEvent) {
      return update((value) => {
        value[idx].storeSecret = (e.target as any).value;
        return value;
      });
    },
    updateNetworkEnv(idx: number, e: Event) {
      return update((value) => {
        value[idx].networkEnv = (e.target as any).selectedIndex === 0 ? "test" : "dev"; // prettier-ignore
        return value;
      });
    },
    updateName(idx: number, e: InputEvent) {
      return update((value) => {
        value[idx].name = (e.target as any).value;
        return value;
      });
    },
    addProfile() {
      update((value) => {
        value.push(createProfile());
        return value;
      });
    },
    deleteProfile(idx: number) {
      update((value) => {
        value.splice(idx, 1);
        return value;
      });
    },

    load(password: string) {
      const data = localStorage.getItem(KEY);
      if (data === null) {
        return;
      }

      try {
        const profiles = JSON.parse(decrypt(data, password).toString(enc.Utf8));
        if (profiles instanceof Array) {
          update((value) => {
            value = profiles;
            return value;
          });
        }
      } catch {}
    },

    save(password: string) {
      const profiles = get(store);
      const data = JSON.stringify(profiles);
      localStorage.setItem(KEY, encrypt(data, password).toString()); // prettier-ignore
    },
  };
}

export default createBaseConfig();
