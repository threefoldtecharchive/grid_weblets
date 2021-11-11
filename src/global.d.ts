/// <reference types="svelte" />

import * as client from "ts-rmb-http-client";
import * as grid3_client from "grid3_client";
import * as polkadot from "@polkadot/extension-dapp";

interface AppConfigs {
  client: typeof client;
  grid3_client: typeof grid3_client;
  polkadot: typeof polkadot;
}

declare global {
  interface Window {
    configs: AppConfigs;
  }
}
