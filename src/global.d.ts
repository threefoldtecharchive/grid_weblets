/// <reference types="svelte" />

import * as client from "ts-rmb-http-client";
import * as grid3_client from "grid3_client";
interface AppConfigs {
  client: typeof client;
  grid3_client: typeof grid3_client;
}

declare global {
  interface Window {
    configs: AppConfigs;
  }
}
