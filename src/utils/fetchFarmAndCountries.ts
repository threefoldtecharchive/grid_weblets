import type { IProfile } from "../types/Profile";
import gqlApi from "./gqlApi";

const queryCount = `
query GetLimits {
    farms: farmsConnection(orderBy: farmID_ASC) { farms_limit: totalCount }
    countries: countriesConnection(orderBy: countryID_ASC) { countries_limit: totalCount }
}
`;

interface IQueryCount {
  farms: { farms_limit: number };
  countries: { countries_limit: number };
}

const queryData = `
query GetData($farms_limit: Int!, $countries_limit: Int!) {
    farms(limit: $farms_limit) { name }
    countries(limit: $countries_limit) { name code }
}
`;

interface IQueryData {
  farms: Array<{ name: string }>;
  countries: Array<{ name: string; code: string }>;
}

export default function fetchFarmAndCountries(profile: IProfile) {
  return gqlApi<IQueryCount>(profile, queryCount)
    .then(({ farms: { farms_limit }, countries: { countries_limit } }) => {
      return { farms_limit, countries_limit };
    })
    .then((vars) => {
      return gqlApi<IQueryData>(profile, queryData, vars);
    });
}
