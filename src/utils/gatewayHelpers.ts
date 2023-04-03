import type { IStore } from "./../stores/currentDeployment";
import { solutionList } from "../stores/solutionsList";
import type { NodeInfo } from "grid3_client";

export interface GatewayNodes {
  nodeDomain: string;
  nodeId: number;
  idx?: number;
}
export async function selectGatewayNode(): Promise<[number, string]> {
  const { GridClient, randomChoice } = window.configs.grid3_client;

  const grid = new GridClient({
    network: window.env.NETWORK,
    mnemonic: "",
    storeSecret: "secret",
  });
  grid._connect();

  const nodes = grid.capacity;
  const selectedNode = randomChoice(await nodes.filterNodes({ gateway: true }));

  const nodeId = selectedNode.nodeId;
  const nodeDomain = selectedNode.publicConfig.domain;
  return [nodeId, nodeDomain];
}

export function selectSpecificGatewayNode(gateway: GatewayNodes): [number, string] {
  const nodeId = gateway.nodeId;
  const nodeDomain = gateway.nodeDomain;

  return [nodeId, nodeDomain];
}

export async function LoadGatewayNodes(): Promise<GatewayNodes[]> {
  const { GridClient } = window.configs.grid3_client;
  const grid = new GridClient({
    network: window.env.NETWORK,
    mnemonic: "",
    storeSecret: "secret",
  });
  grid._connect();

  const nodes = grid.capacity;
  let LoadedNodes: NodeInfo[] = [];
  let exhausted = false;
  let idx = 1;
  while (!exhausted) {
    const LoadedNodesPartial = await nodes.filterNodes({ gateway: true, page: idx });
    if (LoadedNodesPartial.length === 0) {
      exhausted = true;
    } else {
      idx++;
      LoadedNodes = LoadedNodes.concat(LoadedNodesPartial);
    }
  }
  const gws: GatewayNodes[] = [];

  for (const node of LoadedNodes) {
    gws.push({
      nodeDomain: node.publicConfig.domain,
      nodeId: node.nodeId,
    });
  }

  return gws;
}
export async function getUniqueDomainName(profile, name, solutionType: IStore["type"]) {
  const { mnemonics } = profile;
  const client = new window.configs.grid3_client.GridClient({
    mnemonic: mnemonics,
    backendStorageType: window.configs.grid3_client.BackendStorageType.tfkvstore,
    projectName: solutionType,

    network: window.env.NETWORK,
    substrateURL: window.env.SUBSTRATE_URL,
    proxyURL: window.env.GRIDPROXY_URL,
    graphqlURL: window.env.GRAPHQL_URL,
    activationURL: window.env.ACTIVATION_SERVICE_URL,
    relayURL: window.env.RELAY_DOMAIN,
  });

  const solutionCode = solutionList[solutionType];
  await client.connect();
  const twin_id = await client.twins.get_my_twin_id();
  return `${solutionCode}${twin_id}${name.toLowerCase()}`;
}
