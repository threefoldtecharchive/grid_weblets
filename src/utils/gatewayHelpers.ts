const { GridClient, Nodes, randomChoice } = window.configs?.grid3_client ?? {};

export async function selectGatewayNode(): Promise<[number, string]> {
  const nodes = new Nodes(
    GridClient.config.graphqlURL,
    GridClient.config.rmbClient["proxyURL"]
  );

  const selectedNode = randomChoice(await nodes.filterNodes({ gateway: true }));

  const nodeId = selectedNode.nodeId;
  const nodeDomain = selectedNode.publicConfig.domain;

  return [nodeId, nodeDomain];
}

export async function getUniqueDomainName(
  grid,
  solutionCode,
  name,
  profile?,
  solutionType?
) {
  const { networkEnv, mnemonics, storeSecret } = profile;
  const client = new window.configs.grid3_client.GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    new window.configs.client.HTTPMessageBusClient(0, "", "", ""),
    solutionType,
    window.configs.grid3_client.BackendStorageType.tfkvstore
  );

  await client.connect();
  let twin_id = await client.twins.get_my_twin_id();
  return `${solutionCode}${twin_id}${name.toLowerCase()}`;
}
