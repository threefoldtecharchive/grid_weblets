import { get, writable } from "svelte/store";
import { enc } from "crypto-js";
import md5 from "crypto-js/md5";
import { encrypt, decrypt } from "crypto-js/aes";
import { v4 } from "uuid";
import type { IProfile } from "../types/Profile";
import getBalance from "../utils/getBalance";

const PREFIX = "v2.";
const createProfile = (name = "", m = "", s = "", n = "dev", key = "") => ({ id: v4(), name, mnemonics: m, storeSecret: s, networkEnv: n, sshKey: key }); // prettier-ignore

function createBaseConfig() {
  const store = writable({
    profiles: [createProfile("Profile 1")],
    activeProfile: null,
    balance: null,
    selectedIdx: "0",
    loadingBalance: false,
  });

  function hashPassword(password: string) {
    return PREFIX + md5(password).toString();
  }

  function getEncryptedStore(password: string) {
    const data = JSON.stringify(get(store));
    return encrypt(data, password).toString();
  }

  const { subscribe, set, update } = store;

  const fullStore = {
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
        value.selectedIdx = (
          value.profiles.push(createProfile()) - 1
        ).toString();
        return value;
      });
    },
    deleteProfile(idx: number) {
      update((value) => {
        if (value.profiles[idx].id === value.activeProfile) {
          value.activeProfile = null;
        }
        value.profiles.splice(idx, 1);
        if (value.selectedIdx === idx.toString()) {
          value.selectedIdx = (idx - 1).toString();
        }
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

        if (get(store).activeProfile) {
          fullStore.updateBalance();
        }
      } catch {
        return "Incorrect data.";
      }
    },

    _setBalance(balance: number) {
      return update((value) => {
        value.balance = balance;
        return value;
      });
    },
    _setLoadingBalance(loading: boolean) {
      return update((value) => {
        value.loadingBalance = loading;
        return value;
      });
    },

    updateBalance() {
      const { activeProfile } = get(store);
      if (!activeProfile) {
        fullStore._setLoadingBalance(false);
        return fullStore._setBalance(null);
      }

      fullStore._setLoadingBalance(true);
      getBalance(fullStore.getActiveProfile())
        .then((balance) => {
          console.log({ balance });

          fullStore._setBalance(balance);
        })
        .catch((err) => {
          console.log("Error while loading balance", err);
        })
        .finally(() => {
          console.log({ fullStore });

          fullStore._setLoadingBalance(false);
        });
    },

    save(password: string) {
      const hash = hashPassword(password);

      if (localStorage.getItem(hash) === null) {
        return "Password wasn't found.";
      }

      localStorage.setItem(hash, getEncryptedStore(password)); // prettier-ignore
      window.configs.notificationStore.notify("success", "Saved!");
    },

    setActiveProfile(id: string, password: string) {
      update((value) => {
        value.activeProfile = id;
        return value;
      });
      requestAnimationFrame(() => {
        fullStore.updateBalance();
        fullStore.save(password);
      });
    },

    getActiveProfile(): IProfile | null {
      const data = get(store);
      if (data.activeProfile === null) return null;
      const idx = data.profiles.findIndex((p) => p.id === data.activeProfile);
      const profile = data.profiles[idx] as any;
      profile.balance = data.balance;
      return profile;
    },

    setSelectedIdx(val: string) {
      return update((value) => {
        value.selectedIdx = val;
        return value;
      });
    },
  };

  return fullStore;
}

export default createBaseConfig();
