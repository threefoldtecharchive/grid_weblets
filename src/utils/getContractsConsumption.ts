import type { GridClient } from "grid3_client";
import type { IProfile } from "../types/Profile";
import formatConsumption from "./formatConsumption";
import getGrid from "./getGrid";

export interface IContract {
  id: number;
  type: "name" | "node";
  state: "Created" | "GracePeriod";
  expiration?: string;
  deploymentData: any;
  createdAt: Date;
  nodeID: number;
}

function _getConsumption(id: number, grid: GridClient) {
  return grid.contracts
    .getConsumption({ id })
    .then(formatConsumption)
    .catch(() => formatConsumption(0));
}

export default function getContractsConsumption(
  profile: IProfile,
  contracts: { id: number }[]
) {
  return getGrid(profile, (grid) => {
    return Promise.all(contracts.map(({ id }) => _getConsumption(+id, grid)));
  });
}
