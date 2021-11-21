import { get, writable } from "svelte/store";
import { enc } from "crypto-js";
import md5 from "crypto-js/md5";
import { encrypt, decrypt } from "crypto-js/aes";

const createProfile = (name = "", m = "", s = "", n = "dev", key = "") => ({ name, mnemonics: m, storeSecret: s, networkEnv: n, sshKey: key }); // prettier-ignore

function createBaseConfig() {
  const store = writable([createProfile("Profile 1")]);

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
    updateSshKey(idx: number, e: InputEvent) {
      return update((value) => {
        value[idx].sshKey = (e.target as any).value;
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

    create(password: string) {
      const hash = hashPassword(password);

      if (localStorage.getItem(hash) !== null) {
        return "Password already exists.";
      }

      localStorage.setItem(hash, getEncryptedStore(password));
    },

    load(password: string) {
      const hash = hashPassword(password);
      const data = localStorage.getItem(hash);

      if (data === null) {
        return "Password is not correct.";
      }

      try {
        set(JSON.parse(decrypt(data, password).toString(enc.Utf8)));
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
  };
}

export default createBaseConfig();
