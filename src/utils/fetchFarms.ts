import type { FilterOptions } from "grid3_client";
import type { IProfile } from "../types/Profile";
import gqlApi from "./gqlApi";

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
    farms(limit: $farms_limit) { name }
}
`;

const queryDataIPFilter = `
query GetData($farms_limit: Int!) {
  farms(limit: $farms_limit, where: {publicIPs_some: {}}) {
    name
  }
}
`;

interface IQueryData {
  farms: Array<{ name: string }>;
}


export default function fetchFarms(profile: IProfile, filters: FilterOptions,) {
  var query = queryCount;
  var queryDataSelect = queryData;
  if(filters.publicIPs){
    query = queryCountIPFilter;
    queryDataSelect = queryDataIPFilter;
  }
    
  return gqlApi<IQueryCount>(profile, query)
    .then(({ farms: { farms_limit }}) => {
      return { farms_limit };
    })
    .then((vars) => {
      return gqlApi<IQueryData>(profile, queryDataSelect, vars);
    });
}
