import type { IProfile } from "../types/Profile";
const { GridClient } = window.configs?.grid3_client ?? {};

export default function gqlApi(
  profile: IProfile,
  name: string,
  query: string,
  variables: Object = {}
) {
  const { networkEnv } = profile;
  const grid = new GridClient("" as any, "", "", null);

  const { graphql } = grid.getDefaultUrls(networkEnv as any);

  return fetch(graphql, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })
    .then((res) => res.json())
    .then((res) => res.data[name]);
}
