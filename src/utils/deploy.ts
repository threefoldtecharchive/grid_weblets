import type { GridClient } from "grid3_client";
import type { IStore } from "../stores/currentDeployment";
import type { IProfile } from "../types/Profile";
import getGrid from "./getGrid";

export default function deploy<T>(
  profile: IProfile,
  type: IStore["type"],
  name: string,
  deployer: (grid: GridClient) => Promise<T>
) {
  window.configs.currentDeploymentStore.deploy(type, name);
  return getGrid(profile, (grid) => {
    return deployer(grid)
      .then((res) => {
        window.configs.balanceStore.updateBalance();
        return res;
      })
      .finally(() => {
        window.configs.currentDeploymentStore.clear();
      });
  });
}
