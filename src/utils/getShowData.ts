import { get } from "svelte/store";
import type { IStore } from "../stores/currentDeployment";

interface Options {
  loading: boolean;
  success: boolean;
  failed: boolean;
  type: IStore["type"];
}

export function getShowData(options: Options) {
  const logs = get(window.configs.currentDeploymentStore);
  const profile = get(window.configs.baseConfig);
  const showLogs = options.loading || (logs !== null && logs.type === options.type);
  const showNoProfile = !showLogs && !profile;
  const showSuccess = !showLogs && !showNoProfile && options.success;
  const showFailed = !showLogs && !showNoProfile && options.failed;
  const showContent = !showLogs && !showNoProfile && !showSuccess && !showFailed;
  return {
    logs: showLogs,
    noProfile: showNoProfile,
    success: showSuccess,
    failed: showFailed,
    content: showContent,
    metadata: options,
  };
}
