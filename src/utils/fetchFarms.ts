import type { FilterOptions } from "grid3_client";
import type { IProfile } from "../types/Profile";
import gqlApi from "./gqlApi";
import { getBlockedFarmsIDs } from "./findNodes";
import paginatedFetcher from "./paginatedFetcher";

const queryCount = `
query GetLimits {
    farms: farmsConnection(orderBy: farmID_ASC) { farms_limit: totalCount }
}
`;

const queryCountIPFilter = `
query GetLimits {
  farms: farmsConnection(where: {publicIPs_some: {}}, orderBy: farmID_ASC) { farms_limit: totalCount }
}
`;

interface IQueryCount {
  farms: { farms_limit: number };
}

const queryData = `
query GetData($farms_limit: Int!) {
    farms(limit: $farms_limit) { name farmID }
}
`;

const queryDataIPFilter = `
query GetData($farms_limit: Int!) {
  farms(limit: $farms_limit, where: {publicIPs_some: {}}) {
    name
    farmID
  }
}
`;

interface IQueryData {
  farms: Array<{ name: string }>;
}

export default function fetchFarms(
  profile: IProfile,
  filters: FilterOptions,
  exclusiveFor: string
) {
  var query = queryCount;
  var queryDataSelect = queryData;
  if (filters.publicIPs) {
    query = queryCountIPFilter;
    queryDataSelect = queryDataIPFilter;
  }

  return gqlApi<IQueryCount>(profile, query)
    .then(({ farms: { farms_limit } }) => {
      return { farms_limit };
    })
    .then(async (vars) => {
      let { farms } = await gqlApi<IQueryData>(profile, queryDataSelect, vars);

      farms = await getOnlineFarms(profile, farms, exclusiveFor);

      return { farms };
    });
}

export async function getOnlineFarms(profile, farms, exclusiveFor) {
  let blockedFarms = [];
  let onlineFarmsSet = new Set();
  let onlineFarmsArr = [];

  if (exclusiveFor) {
    blockedFarms = await getBlockedFarmsIDs(
      exclusiveFor,
      `https://gridproxy.${profile.networkEnv}.grid.tf`,
      `https://graphql.${profile.networkEnv}.grid.tf/graphql`
    );
  }

  const upNodes = await paginatedFetcher(
    `https://gridproxy.${profile.networkEnv}.grid.tf/nodes?&status=up`,
    0,
    50
  );

  for (let node of upNodes) {
    if (!blockedFarms.includes(node.farmId)) {
      onlineFarmsSet.add(node.farmId);
    }
  }

  onlineFarmsArr = Array.from(onlineFarmsSet);

  const onlineFarms = farms.filter((farm) =>
    onlineFarmsArr.includes(farm.farmID)
  );

  return onlineFarms;
}
