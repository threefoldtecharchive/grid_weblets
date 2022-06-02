import type { ISelectOption } from "../types";
import type { IProfile } from "../types/Profile";
import type { FilterOptions } from "grid3_client";
const { GridClient, Nodes, Graphql } = window.configs?.grid3_client ?? {};

export default function findNodes(
  filters: FilterOptions,
  profile: IProfile,
  exclusiveFor = ""
): Promise<ISelectOption[]> {
  return new Promise(async (res) => {
    const { networkEnv } = profile;
    const grid = new GridClient("" as any, "", "", null);

    const { graphql, rmbProxy } = grid.getDefaultUrls(networkEnv as any);
    const nodes = new Nodes(graphql, rmbProxy);

    try {
      let items = await nodes.filterNodes(filters);

      // This step is to prevent selected a node that already has a deployment of the same type.
      // For now, it is only used with presearch.
      if (!filters.publicIPs && exclusiveFor != "") {
        const gqlClient = new Graphql(graphql);
        const res1 = (await gqlClient.query(`query MyQuery {
          nodeContractsConnection(orderBy: id_ASC, where: {deploymentData_contains: "${exclusiveFor}", state_eq: Created}) {
            totalCount
          }
        }`)) as any;
        const totalNumber = res1.data.nodeContractsConnection.totalCount;
        const res2 = (await gqlClient.query(`query MyQuery {
            nodeContracts(where: {deploymentData_contains: "${exclusiveFor}", state_eq: Created}, limit: ${totalNumber}) {
              nodeID
            }
          }`)) as any;
        const nodeIds = res2.data.nodeContracts.map((n) => n.nodeID);

        let farmIds = new Set();
        for (let nodeId of nodeIds) {
          const res = await fetch(`${rmbProxy}/nodes/${nodeId}`);
          farmIds.add((await res.json())["farmId"]);
        }

        let farmNodes = [];
        for (let farmId of farmIds) {
          const res = await gqlClient.query(
            `query MyQuery {
              nodes(where: {farmID_eq: ${farmId}}) {
                nodeID
              }
            }`
          );
          farmNodes.push(...res.data["nodes"]);
        }

        items = items.filter((node) => {
          return farmNodes.find((nodeId) => {
            return node.nodeId === nodeId;
          });
        });
      }
      const resNodes = items.map((node) => {
        return {
          label: `NodeID(${node.nodeId})`,
          value: node.nodeId,
        } as ISelectOption;
      });
      res(resNodes);
    } catch (err) {
      console.log("Error findNodes", err);
      res([]);
    }
  });
}
