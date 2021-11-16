/// <reference types="svelte" />

import * as client from "ts-rmb-http-client";
import * as grid3_client from "grid3_client";
import * as polkadot from "@polkadot/extension-dapp";
import baseConfigStore from "./stores/baseConfig";

interface AppConfigs {
  client: typeof client;
  grid3_client: typeof grid3_client;
  polkadot: typeof polkadot;
  baseConfig: typeof baseConfigStore;
}

declare global {
  interface Window {
    configs: AppConfigs;
  }
}
