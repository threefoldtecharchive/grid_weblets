/// <reference types="svelte" />

import * as client from "ts-rmb-http-client";
import * as grid3_client from "grid3_client";

// stores
import baseConfigStore from "./stores/baseConfig";
import deploymentStore from "./stores/deploymentStore";
import notificationStore from "./stores/notifications";
import currentDeploymentStore from "./stores/currentDeployment";

interface AppConfigs {
  client: typeof client;
  grid3_client: typeof grid3_client;
  baseConfig: typeof baseConfigStore;
  deploymentStore: typeof deploymentStore;
  notificationStore: typeof notificationStore;
  currentDeploymentStore: typeof currentDeploymentStore;
}

declare global {
  interface Window {
    configs: AppConfigs;
  }
}
