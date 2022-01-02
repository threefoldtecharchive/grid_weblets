import type { FilterOptions } from "grid3_client";
import type { ISelectOption } from "../types";
const { GridClient, Nodes } = window.configs?.grid3_client ?? {};
import { byIso } from "country-code-lookup";
import gqlApi from "./gqlApi";

export default function loadNodes(filters: FilterOptions) {
  const profile = window.configs.baseConfig.getActiveProfile();
  const { networkEnv } = profile;
  const grid = new GridClient("" as any, "", "", null);
  const { graphql, rmbProxy } = grid.getDefaultUrls(networkEnv as any);
  const nodeSelection = new Nodes(graphql, rmbProxy);

  return new Promise<ISelectOption[]>(async (res) => {
    try {
      const nodesInfo = await nodeSelection.filterNodes(filters);
      const names = await gqlApi<{ farms: { id: number; name: string }[] }>(
        profile,
        "query _($in: [Int!]!){farms(where: { farmId_in: $in }) {id: farmId name}}",
        { in: nodesInfo.map(({ farmId }) => farmId) }
      );

      const nodes = nodesInfo.map(({ nodeId, country, farmId }) => {
        const c = country.length === 2 ? byIso(country).country : country;
        const name = names.farms.find(({ id }) => id === farmId).name;

        return {
          label: `NodeID(${nodeId}) | FarmName(${name}) | Country(${c})`,
          value: nodeId,
        };
      });

      nodes.sort((a, b) => a.value - b.value);

      res(nodes);
    } catch (err) {
      console.log("Error loadNodes", err);
      res([]);
    }
  });
}
