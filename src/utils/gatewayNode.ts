import type { GridClient, Nodes } from "grid3_client";

export async function gatewayNodes(nodes: Nodes) {
  const gwNodes = await nodes.getAccessNodes();
  return gwNodes;
}

export async function getNodeDomain(
  nodes: Nodes,
  nodeId: number
): Promise<string> {
  const gwNodes = await gatewayNodes(nodes);
  const node = gwNodes[nodeId];
  const domain = node["domain"];
  return domain;
}
