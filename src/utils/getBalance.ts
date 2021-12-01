import type { IProfile } from "../types/Profile";
const { HTTPMessageBusClient } = window.configs?.client ?? {};
const { GridClient } = window.configs?.grid3_client ?? {};

export default async function getBalance(profile: IProfile) {
  if (!profile) return null;

  const { networkEnv, mnemonics, storeSecret } = profile;
  const grid = new GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    new HTTPMessageBusClient(0, ""),
    undefined,
    "tfkvstore" as any
  );

  return grid
    .connect()
    .then<{ free: number }>(() => {
      return grid.balance.getMyBalance();
    })
    .then(async ({ free }) => {
      grid.disconnect();
      return free;
    });
}
