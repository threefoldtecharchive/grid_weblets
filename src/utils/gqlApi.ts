export default function gqlApi<T>(query: string, variables: object = {}): Promise<T> {
  return fetch(window.env.GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })
    .then(res => res.json())
    .then<T>(({ data }) => data);
}
