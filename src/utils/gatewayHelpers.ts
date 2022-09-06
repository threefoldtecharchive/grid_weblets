const { GridClient, Nodes, randomChoice } = window.configs?.grid3_client ?? {};
import { solutionList } from "../stores/solutionsList";

export interface GatewayNodes {
  nodeDomain: string;
  nodeId: number;
  idx?: number;
}
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

export function selectSpecificGatewayNode(gateway:GatewayNodes) :[number,string]{
  
  const nodeId = gateway.nodeId;
  const nodeDomain = gateway.nodeDomain;


  return [nodeId, nodeDomain];

}

export async function LoadGatewayNodes(): Promise<GatewayNodes[]> {
  const nodes = new Nodes(
    GridClient.config.graphqlURL,
    GridClient.config.rmbClient["proxyURL"]
  );
  const LoadedNodes =await nodes.filterNodes({ gateway: true });
  let gws: GatewayNodes[] = [];

  for(const node of LoadedNodes){
    gws.push({
      nodeDomain: node.publicConfig.domain,
      nodeId: node.nodeId,

    });
  }

  return gws;
}
export async function getUniqueDomainName(profile, name, solutionType) {
  const { networkEnv, mnemonics, storeSecret } = profile;
  const client = new window.configs.grid3_client.GridClient(
    networkEnv as any,
    mnemonics,
    storeSecret,
    new window.configs.client.HTTPMessageBusClient(0, "", "", ""),
    solutionType,
    window.configs.grid3_client.BackendStorageType.tfkvstore
  );

  const solutionCode = solutionList[solutionType];
  await client.connect();
  let twin_id = await client.twins.get_my_twin_id();
  return `${solutionCode}${twin_id}${name.toLowerCase()}`;
}
