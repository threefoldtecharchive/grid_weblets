import type { ISelectOption } from "../types";
import type { IProfile } from "../types/Profile";
import type { FilterOptions } from "grid3_client";

export default function findNodes(
  filters: FilterOptions,
  profile: IProfile,
  exclusiveFor = "",
): Promise<ISelectOption[]> {
  async function resolver(res: (x: ISelectOption[]) => void) {
    const gridproxy = window.env.GRIDPROXY_URL;
    const graphql = window.env.GRAPHQL_URL;

    const grid = new window.configs.grid3_client.GridClient({
      network: window.env.NETWORK,
      mnemonic: profile.mnemonics,
    });
    await grid.connect();

    const nodes = grid.capacity;

    try {
      let availableNodes = await nodes.filterNodes(filters);

      if (!filters.publicIPs && exclusiveFor != "") {
        const blockedNodes = await getBlockedNodesIDs(exclusiveFor, gridproxy, graphql);

        // remove the blocked nodes from the nodes the first page
        availableNodes = exclude(blockedNodes, availableNodes);

        let pageNumber = 1;
        // check if there are more pages
        while (availableNodes.length === 0) {
          try {
            pageNumber += 1;
            availableNodes = await nodes.filterNodes({
              ...filters,
              page: pageNumber,
            });
            availableNodes = exclude(blockedNodes, availableNodes);
          } catch (err) {
            console.log("End of the pages.");
            break;
          }
        }
      }

      const resNodes = availableNodes.map(node => {
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
  }
  return new Promise(resolver);
}

async function getBlockedNodesIDs(exclusiveFor: string, gridproxy: string, graphql: string): Promise<number[]> {
  // This step for preventing select a node that already has a deployment of the same type.
  // For now, it is only used with presearch.
  const gqlClient = new window.configs.grid3_client.Graphql(graphql);

  const blockedFarmsIDs = await getBlockedFarmsIDs(exclusiveFor, gridproxy, graphql);

  // get all the nodeIds of all the farms
  const farmsIDs = `[${blockedFarmsIDs.join(", ")}]`;
  const res = await gqlClient.query(
    `query MyQuery {
      nodes(where: {farmID_in: ${farmsIDs}}) {
        nodeID
      }
    }`,
  );
  const farmNodesIDs = [...res.data["nodes"]];

  return farmNodesIDs;
}

export async function getBlockedFarmsIDs(exclusiveFor: string, gridproxy: string, graphql: string): Promise<number[]> {
  const gqlClient = new window.configs.grid3_client.Graphql(graphql);

  // get the total number of deployment of the same type
  const res1 = (await gqlClient.query(`query MyQuery {
          nodeContractsConnection(orderBy: id_ASC, where: {deploymentData_contains: "${exclusiveFor}", state_eq: Created}) {
            totalCount
          }
        }`)) as any;
  const totalNumber = res1.data.nodeContractsConnection.totalCount;

  // get the nodeIds of the deployments
  const res2 = (await gqlClient.query(`query MyQuery {
            nodeContracts(where: {deploymentData_contains: "${exclusiveFor}", state_eq: Created}, limit: ${totalNumber}) {
              nodeID
            }
          }`)) as any;
  const nodeIds = res2.data.nodeContracts.map(n => n.nodeID);

  // get the farmIds of all the used nodes. "in Set to remove duplicates"
  const farmIds = new Set<number>();
  for (const nodeId of nodeIds) {
    const res = await fetch(`${gridproxy}/nodes/${nodeId}`);
    farmIds.add((await res.json())["farmId"]);
  }
  const farmIdsarr = Array.from(farmIds);

  return farmIdsarr;
}

function exclude(blocked, all) {
  // make a list of ids for the blocked nodes
  const blockedNodesIds = blocked.map(n => n.nodeID);

  return all.filter(item => !blockedNodesIds.includes(item.nodeId));
}
