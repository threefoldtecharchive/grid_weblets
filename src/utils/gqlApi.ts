import type { ActiveProfile } from '../stores/activeProfile';

export default function gqlApi<T>(
  profile: ActiveProfile,
  query: string,
  variables: Object = {}
): Promise<T> {
  const { network } = profile;
  const grid = new window.configs.grid3_client.GridClient(
    '' as any,
    '',
    '',
    null
  );

  const { graphql } = grid.getDefaultUrls(network);

  return fetch(graphql, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
    .then((res) => res.json())
    .then<T>(({ data }) => data);
}
