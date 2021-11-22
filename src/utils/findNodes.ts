const { GridClient, Nodes } = window.configs?.grid3_client ?? {};

export default function findNodes() {
  const nodes = new Nodes(
    GridClient.config.graphqlURL,
    GridClient.config.rmbClient["proxyURL"]
  );

  return nodes.filterNodes({
    accessNodeV4: false,
    accessNodeV6: false,
    city: "",
    country: "",
    cru: 0,
    farmId: 0,
    gateway: false,
    hru: 0,
    mru: 0,
    sru: 0,
  });
}
