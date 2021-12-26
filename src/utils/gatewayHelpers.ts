const { GridClient, Nodes, randomChoice } = window.configs?.grid3_client ?? {};

export async function selectGatewayNode() {
  const nodes = new Nodes(
    GridClient.config.graphqlURL,
    GridClient.config.rmbClient["proxyURL"]
  );

  const selectedNode = randomChoice(await nodes.filterNodes({ gateway: true }));

  const nodeId = selectedNode.nodeId;
  const nodeDomain = selectedNode.publicConfig.domain;

  return [nodeId, nodeDomain];
}

export async function getUniqueName(client: any, name: string) {
  let info = await client.machines.getObj(name);

  if (info.length != 0) {
    const suffix = Math.floor(Math.random() * 10);
    name += suffix;
    return getUniqueName(client, name);
  } else {
    return name.toLowerCase();
  }
}
