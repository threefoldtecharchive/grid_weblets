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

export default function fetchFarms(profile: IProfile, filters: FilterOptions, exclusiveFor: string) {
  let query = queryCount;
  let queryDataSelect = queryData;
  if (filters.publicIPs) {
    query = queryCountIPFilter;
    queryDataSelect = queryDataIPFilter;
  }

  return gqlApi<IQueryCount>(query)
    .then(({ farms: { farms_limit } }) => {
      return { farms_limit };
    })
    .then(async vars => {
      let { farms } = await gqlApi<IQueryData>(queryDataSelect, vars);

      farms = await getOnlineFarms(profile, farms, exclusiveFor, filters.publicIPs);

      return { farms };
    });
}

export async function getOnlineFarms(profile, farms, exclusiveFor, publicIp) {
  const graphql = window.env.GRAPHQL_URL;
  const gridproxy = window.env.GRIDPROXY_URL;

  let blockedFarms = [];
  const onlineFarmsSet = new Set();
  let onlineFarmsArr = [];

  if (exclusiveFor && !publicIp) {
    // no need for exclusive for if we have an ip
    blockedFarms = await getBlockedFarmsIDs(exclusiveFor, gridproxy, graphql);
  }

  const upNodes = await paginatedFetcher(`${gridproxy}/nodes?&status=up`, 0, 50);

  for (const node of upNodes) {
    if (!blockedFarms.includes(node.farmId)) {
      onlineFarmsSet.add(node.farmId);
    }
  }

  onlineFarmsArr = Array.from(onlineFarmsSet);

  const onlineFarms = farms.filter(farm => onlineFarmsArr.includes(farm.farmID));

  return onlineFarms;
}
