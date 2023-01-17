import { fb, validators } from "tf-svelte-rx-forms";
import getBalance from "../utils/getBalance";
import getGrid from "../utils/getGrid";
import { SSH_REGEX } from "../utils/validateName";

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
  ],
  [
    async ctrl => {
      try {
        await getGrid({ networkEnv: process.env.NETWORK, mnemonics: ctrl.value } as any, _ => _);
      } catch (e) {
        return { message: e.message };
      }
    },
    async ctrl => {
      const userBalance = await getBalance({ networkEnv: process.env.NETWORK, mnemonics: ctrl.value } as any);
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
]);
