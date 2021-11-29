import type { GridClient, Nodes } from "grid3_client";

export async function gatewayNodes(nodes: Nodes) {
  const gwNodes = await nodes.getAccessNodes();
  return gwNodes;
}

export async function getNodeDomain(nodes: Nodes, nodeId: string) {
  const gwNodes = await gatewayNodes(nodes);
  console.log(gwNodes);
  console.log(Object.keys(gwNodes));
  const node = nodes[nodeId];
  console.log(node);
  const domain = node["domain"];
  return domain;
}
