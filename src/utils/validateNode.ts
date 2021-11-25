import type { IProfile } from "../types/Profile";
import findNodes from "./findNodes";

export default function validateNode(
  profile: IProfile,
  cru: number,
  mru: number,
  sru: number,
  publicIPs: boolean,
  nodeId: number | string
) {
  const filters = { cru, mru: mru / 1024, sru, publicIPs };
  return findNodes(filters, profile)
    .then((nodes) => {
      return nodes.some((node) => node.value === nodeId.toString());
    })
    .then((valid) => {
      return valid
        ? null
        : `The selected node(${nodeId}) doesn't have enough resource. CRU(${cru}) MRU(${mru}) SRU(${sru}) PublicIP(${publicIPs})`;
    });
}
