import type { ISelectOption } from "../types";
import type { IProfile } from "../types/Profile";
import type { FilterOptions } from "grid3_client";
const { GridClient, Nodes } = window.configs?.grid3_client ?? {};
import { byIso } from "country-code-lookup";
import gqlApi from "./gqlApi";

interface IFindNodes {
  nodes: ISelectOption[];
  countries: ISelectOption[];
  farms: ISelectOption[];
}

export default function findNodes(
  filters: FilterOptions,
  profile: IProfile
): Promise<IFindNodes> {
  return new Promise(async (res) => {
    const { networkEnv } = profile;
    const grid = new GridClient("" as any, "", "", null);

    const { graphql, rmbProxy } = grid.getDefaultUrls(networkEnv as any);
    const _nodes = new Nodes(graphql, rmbProxy);

    try {
      const items = await _nodes.filterNodes(filters);

      const nodes = items.map((node) => {
        return {
          label: `NodeID(${node.nodeId})`,
          value: node.nodeId,
        } as ISelectOption;
      });

      const _countries = new Set<string>(
        items.map((node) => {
          if (node.country.length === 2) {
            return byIso(node.country).country;
          }
          return node.country;
        })
      );

      const countries = Array.from(_countries).map((c) => {
        return { label: c, value: c } as ISelectOption;
      });

      const _farms = new Set<number>(items.map((node) => node.farmId));
      const { farms } = await gqlApi<{ farms: ISelectOption[] }>(
        profile,
        "query _($in: [Int!]!){farms(where:{farmId_in: $in}){label: name value: farmId}}",
        {
          in: Array.from(_farms),
        }
      );

      res({ nodes, countries, farms });
    } catch (err) {
      console.log("Error findNodes", err);
      res({ nodes: [], countries: [], farms: [] });
    }
  });
}
