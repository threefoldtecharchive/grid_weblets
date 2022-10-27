import type { GridClient } from 'grid3_client';
import type { ActiveProfile } from '../stores/activeProfile';
import type { IStore } from '../stores/currentDeployment';
import getGrid from './getGrid';

export default function deploy<T>(
  profile: ActiveProfile,
  type: IStore['type'],
  name: string,
  deployer: (grid: GridClient) => Promise<T>
) {
  window.configs.currentDeploymentStore.deploy(type, name);
  return getGrid(profile, (grid) => {
    return deployer(grid).finally(() => {
      window.configs.currentDeploymentStore.clear();
    });
  });
}
