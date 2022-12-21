import { writable } from "svelte/store";

export interface Profile {
  networkEnv: any;
  mnemonics: string;
  sshKey: string;
  twinId: number;
  address: string;
}

export default writable<Profile>();
