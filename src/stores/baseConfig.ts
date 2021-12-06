import { get, writable } from "svelte/store";
import { enc } from "crypto-js";
import md5 from "crypto-js/md5";
import { encrypt, decrypt } from "crypto-js/aes";
import { v4 } from "uuid";
import type { IProfile } from "../types/Profile";

const PREFIX = "v2.";
const createProfile = (name = "", m = "", s = "", n = "dev", key = "") => ({ id: v4(), name, mnemonics: m, storeSecret: s, networkEnv: n, sshKey: key }); // prettier-ignore

function createBaseConfig() {
  const p = createProfile("Profile 1");
  let _initData = {
    profiles: [p],
    activeProfile: null,
    loaded: false,
    balance: null,
    reload_balance: false,
    selectedIdx: "0",
    // loadingBalance: false,
  };

  const session_password = sessionStorage.getItem("session_password");
  if (session_password) {
    try {
      const hash = hashPassword(session_password);
      const data = localStorage.getItem(hash);
      _initData = {
        ...JSON.parse(decrypt(data, session_password).toString(enc.Utf8)),
        loaded: true,
        balance: null,
        reload_balance: false,
        selectedIdx: "0",
        // loadingBalance: false,
      };
    } catch {}
  }

  const store = writable(_initData);

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

        /* TODO: should be removed after fixing issue #95 */
        // const newData = get(store);
        // if (newData.activeProfile) {
        //   window.location.reload();
        // }
      } catch {
        return "Incorrect data.";
      }
    },

    save(password: string) {
      const hash = hashPassword(password || session_password);

      if (localStorage.getItem(hash) === null) {
        return "Password wasn't found.";
      }

      localStorage.setItem(hash, getEncryptedStore(password || session_password)); // prettier-ignore
      window.configs.notificationStore.notify("success", "Saved!");
    },

    setActiveProfile(id: string, password: string) {
      update((value) => {
        value.activeProfile = id;
        return value;
      });
      requestAnimationFrame(() => {
        fullStore.save(password || session_password);
      });

      /* TODO: should be removed after fixing issue #95 */
      // window.location.reload();
    },

    deActiveProfile() {
      return update((value) => {
        value.activeProfile = null;
        return value;
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

    setBalance(balance: number) {
      return update((value) => {
        value.balance = balance;
        return value;
      });
    },

    setReloadBalance(val: boolean = true) {
      return update((value) => {
        if (val) {
          value.reload_balance = val;
          value.balance = null;
        }
        return value;
      });
    },

    // setLoadingBalance(val: boolean) {
    //   return update((value) => {
    //     value.loadingBalance = val;
    //     return value;
    //   });
    // },

    // async loadBalance() {
    // fullStore.setLoadingBalance(true);
    // return getBalance(fullStore.getActiveProfile())
    //   .then((balance) => {
    //     fullStore.setBalance(balance);
    //     return balance;
    //   })
    //   .catch((err) => console.log("Error", err))
    //   .finally(() => fullStore.setLoadingBalance(false));
    // },

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
