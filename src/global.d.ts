/// <reference types="svelte" />

import * as grid3_client from "grid3_client";
import * as buffer from "buffer";
import * as bip39 from "bip39";

// stores
import baseConfigStore from "./stores/baseConfig";
import deploymentStore from "./stores/deploymentStore";
import notificationStore from "./stores/notifications";
import currentDeploymentStore from "./stores/currentDeployment";
import balanceStore from "./stores/balance";
import type { NetworkEnv } from "grid3_client";

interface AppConfigs {
  grid3_client: typeof grid3_client;
  baseConfig: typeof baseConfigStore;
  deploymentStore: typeof deploymentStore;
  notificationStore: typeof notificationStore;
  currentDeploymentStore: typeof currentDeploymentStore;
  balanceStore: typeof balanceStore;
  buffer: typeof buffer;
  bip39: typeof bip39;
}

interface EnvionmentVariables {
  NETWORK: NetworkEnv;
  GRAPHQL_URL: string;
  GRIDPROXY_URL: string;
  SUBSTRATE_URL: string;
  ACTIVATION_SERVICE_URL: string;
  RELAY_DOMAIN: string;
  BRIDGE_TFT_ADDRESS: string;
  STELLAR_NETWORK: string;
  STELLAR_HORIZON_URL: string;
  TFT_ASSET_ISSUER: string;
}

declare global {
  interface Window {
    configs: AppConfigs;
    env?: EnvionmentVariables;
  }
}
