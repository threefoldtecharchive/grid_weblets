import { get, writable } from "svelte/store";
import { enc } from "crypto-js";
import md5 from "crypto-js/md5";
import { encrypt, decrypt } from "crypto-js/aes";
import { v4 } from "uuid";
import type { IProfile } from "../types/Profile";
import getGrid from "../utils/getGrid";

const PREFIX = "v2.";
const createProfile = (name = "", m = "", n = process.env.NETWORK, key = "") => ({ id: v4(), name, mnemonics: m, storeSecret: "", networkEnv: n, sshKey: key }); // prettier-ignore

function createBaseConfig() {
  const store = writable({
    profiles: [createProfile("Profile1")],
    activeProfile: null,
    twinId: null,
    address: null,
    storeSecret: null,
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
      let _idx: string;
      update((value) => {
        _idx = (value.profiles.push(createProfile()) - 1).toString();
        return value;
      });
      return _idx;
    },
    deleteProfile(idx: number, current: string) {
      let _idx: string;
      update((value) => {
        if (value.profiles[idx].id === value.activeProfile) {
          value.activeProfile = null;
        }
        value.profiles.splice(idx, 1);
        if (current === idx.toString()) {
          _idx = (idx - 1).toString();
        }
        return value;
      });
      return _idx ? _idx : current;
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
        update((value) => {
          value.storeSecret = password;
          return value;
        });

        if (get(store).activeProfile) {
          fullStore._loadActiveProfileInfo();
        }
      } catch {
        return "Incorrect data.";
      }
    },

    _loadActiveProfileInfo() {
      getGrid(fullStore.getActiveProfile(), (grid) => {
        grid.twins
          .get_my_twin_id()
          .then((twin) => {
            update((value) => {
              value.twinId = twin;
              value.address = grid.twins.client.client.address;
              return value;
            });
          })
          .catch((err) => {
            console.log("Error", err);
          });
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
        value.storeSecret = id === null ? null : password;
        value.twinId = null;
        value.address = null;
        return value;
      });
      requestAnimationFrame(() => {
        fullStore.save(password);
        if (id !== null) {
          setTimeout(() => {
            fullStore._loadActiveProfileInfo();
          }, 1000);
        }
      });
    },

    getActiveProfile(): IProfile | null {
      const data = get(store);
      if (data.activeProfile === null) return null;
      const idx = data.profiles.findIndex((p) => p.id === data.activeProfile);
      const profile = data.profiles[idx] as IProfile;
      profile.storeSecret = data.storeSecret;
      profile.networkEnv = process.env.NETWORK;
      return profile;
    },
  };

  return fullStore;
}

export default createBaseConfig();
