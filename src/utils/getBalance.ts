import type { ActiveProfile } from '../stores/activeProfile';
import getGrid from './getGrid';

export default async function getBalance(profile: ActiveProfile) {
  if (!profile) return null;

  return getGrid(profile, (grid) => {
    // prettier-ignore
    return grid.balance
      .getMyBalance()
      .then((res) => res);
  });
}
