import { get } from 'svelte/store';

export default function hasEnoughBalance(amount = 2) {
  const activeProfile = get(window.configs.activeProfileStore);
  const value = get(activeProfile.balance);
  return value && value.balance && value.balance >= amount;
}
