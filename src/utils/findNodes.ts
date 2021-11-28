import type { ISelectOption } from "../types";
import type { IProfile } from "../types/Profile";
const { GridClient, Nodes } = window.configs?.grid3_client ?? {};

export default function findNodes(
  filters: any,
  profile: IProfile
): Promise<ISelectOption[]> {
  return new Promise(async (res) => {
    const { networkEnv } = profile;
    const grid = new GridClient("" as any, "", "", null);

    const { graphql, rmbProxy } = grid.getDefaultUrls(networkEnv as any);
    const nodes = new Nodes(graphql, rmbProxy);

    try {
      const items = await nodes.filterNodes(filters);
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
