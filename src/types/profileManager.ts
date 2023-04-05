import { fb, validators } from "tf-svelte-rx-forms";
import { generateKeyPair } from "web-ssh-keygen";
import getBalance from "../utils/getBalance";
import getGrid from "../utils/getGrid";
import { SSH_REGEX } from "../utils/validateName";

const networkEnv = window.env?.NETWORK ?? process.env.NETWORK;

export const noBalanceMessage = "Your balance is not enough.";
export const mnemonics = fb.control<string>(
  "",
  [
    validators.required("Mnemonics is required."),
    ctrl => {
      if (!window.configs.bip39.validateMnemonic(ctrl.value)) {
        return { message: "Mnemonic doesn't seem to be valid." };
      }
    },
    (_, ctx) => {
      if (ctx && ctx.error) {
        return { message: ctx.error };
      }
    },
  ],
  [
    async ctrl => {
      try {
        await getGrid({ networkEnv, mnemonics: ctrl.value } as any, _ => _, "");
      } catch (e) {
        return { message: e.message };
      }
    },
    async ctrl => {
      const userBalance = await getBalance({
        networkEnv,
        mnemonics: ctrl.value,
      } as any);
      if (userBalance.free < 1) {
        return { message: noBalanceMessage };
      }
    },
  ],
);

export const sshKey = fb.control<string>("", [
  validators.required("Public SSH Key is required."),
  ctrl => {
    if (!SSH_REGEX.test(ctrl.value)) {
      return { message: "Public SSH Key doesn't seem to be valid." };
    }
  },
  (_, ctx) => {
    if (ctx && ctx.error) {
      return { message: ctx.error };
    }
  },
]);

export type GetTwinAndAddress = { twinId: number; address: string };
const getTwinAndAddressData = new Map<string, GetTwinAndAddress>();
export function getTwinAndAddress(mnemonics: string): Promise<GetTwinAndAddress | null> {
  if (getTwinAndAddressData.has(mnemonics)) {
    return Promise.resolve(getTwinAndAddressData.get(mnemonics));
  }

  return getGrid({ networkEnv, mnemonics } as any, _ => _, "")
    .then(grid => Promise.all([Promise.resolve(grid), grid.twins.get_my_twin_id()]))
    .then(([grid, twinId]) => {
      getTwinAndAddressData.set(mnemonics, { twinId, address: grid.twins.client.client.address });
      return getTwinAndAddressData.get(mnemonics);
    })
    .catch(() => null);
}

export function readSSH(mnemonics: string): Promise<string> {
  return getGrid({ networkEnv, mnemonics } as any, _ => _, "")
    .then(grid => {
      return grid;
    })
    .then(grid => grid.kvstore.get({ key: "metadata" }))
    .then(metadata => {
      return JSON.parse(metadata).sshkey || "";
    })
    .catch(() => "");
}

export function storeSSH(mnemonics: string, ssh: string): Promise<boolean> {
  const metadata = JSON.stringify({ sshkey: ssh });
  return readSSH(mnemonics)
    .then(oldSsh => {
      if (ssh === oldSsh) return true;
      return getGrid({ networkEnv, mnemonics } as any, _ => _, "")
        .then(grid => grid.kvstore.set({ key: "metadata", value: metadata }))
        .then(() => true);
    })
    .catch(() => false);
}

export const password = fb.control<string>("", [
  validators.required("Password is required."),
  (_, ctx) => {
    if (ctx && ctx.error) {
      return { message: ctx.error };
    }
  },
]);

async function resolve<T>(promise: Promise<T>): Promise<[T, Error]> {
  try {
    return [await promise, null];
  } catch (error) {
    return [null, error];
  }
}

export async function migrate(mnemonics: string, storeSecret: string) {
  const oldClient = await getGrid({ networkEnv, mnemonics, storeSecret } as any, _ => _, ""); // prettier-ignore
  const newClient = await getGrid({ networkEnv, mnemonics } as any, _ => _,""); // prettier-ignore

  const oldDB = oldClient.kvstore;
  const newDB = newClient.kvstore;

  const extrinsics = <any[]>[];
  const [keys, error] = await resolve<string[]>(oldClient.kvstore.list());
  if (error) {
    oldClient.disconnect();
    throw new Error("Failed to get keys.");
  }

  // const total = keys.length;
  let failed = 0;
  let migrated = 0;
  for (const key of keys) {
    const [v1, e1] = await resolve(oldDB.get({ key }));
    if (!e1) {
      extrinsics.push(newDB.client.client.api.tx.tfkvStore.set(key, newDB.client.kvStore.encrypt(v1)));
      continue;
    }

    const [_, e2] = await resolve(newDB.get({ key }));
    e2 ? failed++ : migrated++;
  }

  // if (failed > 0 && extrinsics.length === 0) {
  //   oldClient.disconnect();
  //   throw new Error("StoreSecret is wrong. Please enter the right storeSecret.");
  // }

  if (extrinsics.length > 0) {
    const [_, error] = await resolve(newClient.utility.batchAll({ extrinsics }));
    if (error) {
      oldClient.disconnect();
      throw error;
    }
  }

  // if (failed > 0 && extrinsics.length !== 0) {
  //   oldClient.disconnect();
  //   throw new Error(
  //     "Part of the keys are migrated successfully, but still some keys are not migrated. Maybe they are encrypted with different password or not encrypted",
  //   );
  // }

  oldClient.disconnect();
  return { total: keys.length, migrated, failed };
}

export function generateSSH(mnemonics: string) {
  let keys: ReturnType<typeof generateKeyPair> extends Promise<infer T> ? T : unknown;

  return generateKeyPair({
    alg: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
    name: "Threefold",
    size: 4096,
  })
    .then(_keys => (keys = _keys))
    .then(() => getGrid({ networkEnv, mnemonics } as any, _ => _, ""))
    .then(grid => grid.kvstore.set({ key: "metadata", value: JSON.stringify({ sshkey: keys.publicKey }) }))
    .then(() => {
      const data = `data:text/raw;charset=utf-8,${encodeURIComponent(keys.privateKey)}`;
      const a = document.createElement("a");
      a.download = "id_rsa";
      a.href = data;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return keys;
    });
}
