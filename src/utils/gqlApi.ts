import type { NetworkEnv } from "grid3_client";
import type { IProfile } from "../types/Profile";

export default function gqlApi<T>(
  profile: IProfile,
  // name: string,
  query: string,
  variables: object = {},
): Promise<T> {
  const { networkEnv } = profile;
  const grid = new window.configs.grid3_client.GridClient("" as unknown as NetworkEnv, "", "");

  const { graphql } = grid.getDefaultUrls(networkEnv as unknown as NetworkEnv);

  return fetch(graphql, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })
    .then(res => res.json())
    .then<T>(({ data }) => data);
}
