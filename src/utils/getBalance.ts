import type { Profile } from "../stores/baseConfig";
import getGrid from "./getGrid";

export default async function getBalance(profile: Profile) {
  if (!profile) return null;

  return getGrid(
    { networkEnv: window.env?.NETWORK ?? process.env.NETWORK, mnemonics: profile.mnemonics } as any,
    grid => {
      // prettier-ignore
      return grid.balance
      .getMyBalance()
      .then((res) => res);
    },
    "",
  );
}
