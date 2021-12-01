import type { IProfile } from "../types/Profile";

export default function hasEnoughBalance(profile: IProfile, amount = 2) {
  const { balance } = profile;
  return balance && balance >= amount;
}
