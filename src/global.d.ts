/// <reference types="svelte" />

import * as client from "ts-rmb-http-client";
import * as grid3_client from "grid3_client";
import * as polkadot from "@polkadot/api";
import baseConfigStore from "./stores/baseConfig";
import deploymentStore from "./stores/deploymentStore";
import * as bip39 from "bip39";

interface AppConfigs {
  client: typeof client;
  grid3_client: typeof grid3_client;
  polkadot: typeof polkadot;
  baseConfig: typeof baseConfigStore;
  deploymentStore: typeof deploymentStore;
  bip39: typeof bip39;
}

declare global {
  interface Window {
    configs: AppConfigs;
  }
}
