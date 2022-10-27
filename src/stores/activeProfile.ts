import ProfileManager, { Profile, Listener } from 'tf-profile-manager';
import { writable, Writable } from 'svelte/store';
import getGrid from '../utils/getGrid';

async function _createActiveProfileStore(cb: Listener) {
  if (await ProfileManager.isInstalled) {
    ProfileManager.subscribe(cb);
  }
}

function _createBalanceStore(profile: Profile) {
  const balanceStore = writable<{
    balance: number;
    locked: number;
  }>();

  getGrid(profile, (_) => _).then((grid) => {
    ProfileManager.subscribeToBalance(grid, (balance) => {
      balanceStore.set(balance);
    });
  });

  return balanceStore;
}

export interface ActiveProfile extends Profile {
  balance: Writable<{
    balance: number;
    locked: number;
  }>;
}

function createActiveProfileStore() {
  const { subscribe, set } = writable<ActiveProfile | null>(null);

  _createActiveProfileStore((profile) => {
    if (!profile) return set(null);
    set({
      ...profile,
      balance: _createBalanceStore(profile),
    });
  });

  return {
    subscribe,
  };
}

export default createActiveProfileStore();
