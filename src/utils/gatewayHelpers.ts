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
  let info = await client.gateway.getObj(name);

  if (info.length != 0) {
    const suffix = Math.floor(Math.random() * 10);
    name += suffix;
    return getUniqueName(client, name);
  } else {
    return name.toLowerCase();
  }
}

export async function getUniqueDomainName(client, solution_type, name) {
  let twin_id = await client.twins.get_my_twin_id();
  let domainName = `${solution_type}${twin_id}${name}`;
  domainName = await getUniqueName(client, domainName);
  return domainName;
}
