import { get, writable } from "svelte/store";
import { enc } from "crypto-js";
import { encrypt, decrypt } from "crypto-js/aes";

const KEY = "BASE_CONFIGS";
const createProfile = (m = "", s = "", n = "dev") => ({ mnemonics: m, storeSecret: s, networkEnv: n }); // prettier-ignore

function createBaseConfig() {
  const store = writable({
    loaded: false,
    profiles: [createProfile()],
  });

  const { subscribe, set, update } = store;
  return {
    subscribe,
    set,
    update,
    addProfile() {
      update((value) => {
        value.profiles.push(createProfile());
        return value;
      });
    },
    deleteProfile(idx: number) {
      update((value) => {
        value.profiles.splice(idx, 1);
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
            value.loaded = true;
            value.profiles = profiles;
            return value;
          });
        }
      } catch {}
    },

    save(password: string) {
      const { profiles } = get(store);
      const data = JSON.stringify(profiles);
      localStorage.setItem(KEY, encrypt(data, password).toString()); // prettier-ignore
    },
  };
}

export default createBaseConfig();
