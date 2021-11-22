const { GridClient, Nodes } = window.configs?.grid3_client ?? {};

export default function findNodes(filters: any) {
  const nodes = new Nodes(
    "https://graphql.dev.grid.tf/graphql",
    "https://gridproxy.dev.grid.tf"
  );

  return nodes.filterNodes(filters);
}
