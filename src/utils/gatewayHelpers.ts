import { get } from "svelte/store";
import type { ActiveProfile } from "../stores/activeProfile";
import { solutionList } from "../stores/solutionsList";
import getGrid from "./getGrid";

export interface GatewayNodes {
  nodeDomain: string;
  nodeId: number;
  idx?: number;
}

async function _checkGrid() {
  const { GridClient } = window.configs.grid3_client;

  if (!GridClient.config) {
    const grid = await getGrid(get(window.configs.activeProfileStore), _ => _);
    await grid.connect();
  }
}

export async function selectGatewayNode(): Promise<[number, string]> {
  await _checkGrid();

  const { GridClient, Nodes, randomChoice } = window.configs.grid3_client;

  const nodes = new Nodes(
    GridClient.config.graphqlURL,
    GridClient.config.rmbClient["proxyURL"],
    GridClient.config.rmbClient
  );

  const selectedNode = randomChoice(await nodes.filterNodes({ gateway: true }));

  const nodeId = selectedNode.nodeId;
  const nodeDomain = selectedNode.publicConfig.domain;
  return [nodeId, nodeDomain];
}

export function selectSpecificGatewayNode(
  gateway: GatewayNodes
): [number, string] {
  const nodeId = gateway.nodeId;
  const nodeDomain = gateway.nodeDomain;

  return [nodeId, nodeDomain];
}

export async function LoadGatewayNodes(): Promise<GatewayNodes[]> {
  await _checkGrid();

  const { GridClient, Nodes } = window.configs.grid3_client;
  const nodes = new Nodes(
    GridClient.config.graphqlURL,
    GridClient.config.rmbClient["proxyURL"],
    GridClient.config.rmbClient
  );
  const LoadedNodes = await nodes.filterNodes({ gateway: true });
  let gws: GatewayNodes[] = [];

  for (const node of LoadedNodes) {
    gws.push({
      nodeDomain: node.publicConfig.domain,
      nodeId: node.nodeId,
    });
  }

  return gws;
}
export async function getUniqueDomainName(profile: ActiveProfile, name, solutionType) {
  await _checkGrid();

  const { network, mnemonics, secret } = profile;
  const client = new window.configs.grid3_client.GridClient(
    network,
    mnemonics,
    secret,
    new window.configs.client.HTTPMessageBusClient(0, "", "", ""),
    solutionType,
    window.configs.grid3_client.BackendStorageType.tfkvstore
  );

  const solutionCode = solutionList[solutionType];
  await client.connect();
  let twin_id = await client.twins.get_my_twin_id();
  return `${solutionCode}${twin_id}${name.toLowerCase()}`;
}
