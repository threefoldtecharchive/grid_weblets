import type { IProfile } from "../types/Profile";
import getGrid from "./getGrid";

export default async function getBalance(profile: IProfile) {
  if (!profile) return null;

  return getGrid(profile, (grid) => {
    // prettier-ignore
    return grid.balance
      .getMyBalance()
      .then((res) => res);
  });
}

