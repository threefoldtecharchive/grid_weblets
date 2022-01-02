import type { FilterOptions } from "grid3_client";
import type { ISelectOption } from "../types";
const { GridClient, Nodes } = window.configs?.grid3_client ?? {};
import { byIso } from "country-code-lookup";
import gqlApi from "./gqlApi";

interface ILoadNodes {
  nodes: ISelectOption[];
  countries: ISelectOption[];
  farmNames: ISelectOption[];
}

export default function loadNodes(filters: FilterOptions) {
  const profile = window.configs.baseConfig.getActiveProfile();
  const { networkEnv } = profile;
  const grid = new GridClient("" as any, "", "", null);
  const { graphql, rmbProxy } = grid.getDefaultUrls(networkEnv as any);
  const nodeSelection = new Nodes(graphql, rmbProxy);

  return new Promise<ILoadNodes>(async (res) => {
    try {
      const nodesInfo = await nodeSelection.filterNodes(filters);
      const countriesInfo = nodesInfo.map(({ country }) => country.length === 2 ? byIso(country).country : country); // prettier-ignore
      const farmInfo = nodesInfo.map(({ farmId }) => farmId);

      const _farmNames = await gqlApi<{ farms: ISelectOption[] }>(
        profile,
        "query _($in: [Int!]!){farms(where: { farmId_in: $in }) {label: name value: farmId}}",
        { in: farmInfo }
      );
      const farmNames = _farmNames.farms;
      const _countries = Array.from(new Set(countriesInfo));
      const countries = _countries.map(c => ({ label: c, value: c } as ISelectOption)); // prettier-ignore
      const nodes = nodesInfo.map(({ nodeId }) => ({ label: `NodeID(${nodeId})`, value: nodeId } as ISelectOption)); // prettier-ignore

      res({ nodes, countries, farmNames });
    } catch (err) {
      console.log("Error loadNodes", err);
      res({ nodes: [], countries: [], farmNames: [] });
    }
  });
}
