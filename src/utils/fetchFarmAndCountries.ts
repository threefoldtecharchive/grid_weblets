import type { FilterOptions } from "grid3_client";
import type { IProfile } from "../types/Profile";
import gqlApi from "./gqlApi";

const queryCount = `
query GetLimits {
    farms: farmsConnection(orderBy: farmID_ASC) { farms_limit: totalCount }
    countries: countriesConnection(orderBy: countryID_ASC) { countries_limit: totalCount }
}
`;

const queryCountIPFilter = `
query GetLimits {
  farms: farmsConnection(where: {publicIPs_some: {}}, orderBy: farmID_ASC) { farms_limit: totalCount }
  countries: countriesConnection(orderBy: countryID_ASC) { countries_limit: totalCount }

}
`;

interface IQueryCount {
  farms: { farms_limit: number };
  countries: { countries_limit: number };
}

const queryData = `
query GetData($farms_limit: Int!, $countries_limit: Int!) {
    farms(limit: $farms_limit) { name farmID }
    countries(limit: $countries_limit) { name code }
}
`;

const queryDataIPFilter = `
query GetData($farms_limit: Int!, $countries_limit: Int!) {
  farms(limit: $farms_limit, where: {publicIPs_some: {}}) {
    name
    farmID
  }
  countries(limit: $countries_limit) {
    name
    code
  }
}
`;

interface IQueryData {
  farms: Array<{ name: string }>;
  countries: Array<{ name: string; code: string }>;
}

export default function fetchFarmAndCountries(profile: IProfile, filters: FilterOptions,) {
  var query = queryCount;
  var queryDataSelect = queryData;
  if(filters.publicIPs){
    query = queryCountIPFilter;
    queryDataSelect = queryDataIPFilter;
  }
    
  return gqlApi<IQueryCount>(profile, query)
    .then(({ farms: { farms_limit }, countries: { countries_limit } }) => {
      return { farms_limit, countries_limit };
    })
    .then(async (vars) => {
      let { farms, countries } = await gqlApi<IQueryData>(profile, queryDataSelect, vars);

      farms = await getOnlineFarms(profile, farms);

      return { farms, countries };
    });
}

export async function getOnlineFarms(profile, farms) {
  let onlineFarms = [];

  for (let farm of farms) {
    let data = await fetch(
      `https://gridproxy.${profile.networkEnv}.grid.tf/nodes?farm_ids=${farm.farmID}&status=up`
    ).then((response) => response.json());

    if (data.length > 0) onlineFarms.push(farm);
  }

  return onlineFarms;
}
