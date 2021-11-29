import { get, writable } from "svelte/store";
import { enc } from "crypto-js";
import md5 from "crypto-js/md5";
import { encrypt, decrypt } from "crypto-js/aes";
import { v4 } from "uuid";

const createProfile = (name = "", m = "", s = "", n = "dev", key = "") => ({ id: v4(), name, mnemonics: m, storeSecret: s, networkEnv: n, sshKey: key }); // prettier-ignore

function createBaseConfig() {
  const p = createProfile("Profile 1");
  let _initData = {
    profiles: [p],
    activeProfile: null,
    loaded: false,
  };

  const password = sessionStorage.getItem("session_password");
  if (password) {
    try {
      const hash = hashPassword(password);
      const data = localStorage.getItem(hash);
      _initData = {
        ...JSON.parse(decrypt(data, password).toString(enc.Utf8)),
        loaded: true,
      };
    } catch {}
  }

  console.log({ data: _initData });

  const store = writable(_initData);

  function hashPassword(password: string) {
    return md5(password).toString();
  }

  function getEncryptedStore(password: string) {
    const data = JSON.stringify(get(store));
    return encrypt(data, password).toString();
  }

  const { subscribe, set, update } = store;

  return {
    subscribe,
    set,
    update,
    updateMnemonics(idx: number, e: InputEvent) {
      return update((value) => {
        value.profiles[idx].mnemonics = (e.target as any).value;
        return value;
      });
    },
    updateStoreSecret(idx: number, e: InputEvent) {
      return update((value) => {
        value.profiles[idx].storeSecret = (e.target as any).value;
        return value;
      });
    },
    updateNetworkEnv(idx: number, e: Event) {
      return update((value) => {
        value.profiles[idx].networkEnv = (e.target as any).selectedIndex === 0 ? "test" : "dev"; // prettier-ignore
        return value;
      });
    },
    updateName(idx: number, e: InputEvent) {
      return update((value) => {
        value.profiles[idx].name = (e.target as any).value;
        return value;
      });
    },
    updateSshKey(idx: number, e: InputEvent) {
      return update((value) => {
        value.profiles[idx].sshKey = (e.target as any).value;
        return value;
      });
    },
    addProfile() {
      update((value) => {
        value.profiles.push(createProfile());
        return value;
      });
    },
    deleteProfile(idx: number) {
      update((value) => {
        if (value.profiles[idx].id === value.activeProfile) {
          value.activeProfile = value.profiles[0].id;
        }
        value.profiles.splice(idx, 1);
        return value;
      });
    },

    create(password: string) {
      const hash = hashPassword(password);

      if (localStorage.getItem(hash) !== null) {
        return "Password already exists.";
      }

      localStorage.setItem(hash, getEncryptedStore(password));
      sessionStorage.setItem("session_password", password);
    },

    load(password: string) {
      const hash = hashPassword(password);
      const data = localStorage.getItem(hash);

      if (data === null) {
        return "Password is not correct.";
      }

      try {
        set(JSON.parse(decrypt(data, password).toString(enc.Utf8)));
        sessionStorage.setItem("session_password", password);
      } catch {
        return "Incorrect data.";
      }
    },

    save(password: string) {
      const hash = hashPassword(password);

      if (localStorage.getItem(hash) === null) {
        return "Password wasn't found.";
      }

      localStorage.setItem(hash, getEncryptedStore(password));
    },

    setActiveProfile(id: string) {
      return update((value) => {
        value.activeProfile = id;
        return value;
      });
    },

    deActiveProfile() {
      return update((value) => {
        value.activeProfile = null;
        return value;
      });
    },

    getActiveProfile() {
      const data = get(store);
      if (data.activeProfile === null) return null;
      const idx = data.profiles.findIndex((p) => p.id === data.activeProfile);
      return data.profiles[idx];
    },
  };
}

export default createBaseConfig();
