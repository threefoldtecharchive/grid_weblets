import type { IProfile } from "../types/Profile";
import findNodes from "./findNodes";

export default function validateNode(
  profile: IProfile,
  cru: number,
  mru: number,
  sru: number,
  publicIPs: boolean,
  nodeId: number | string,
) {
  // TODO: validate the node existence separately
  const filters = { cru, mru: mru / 1024, sru, publicIPs };
  return findNodes(filters, profile)
    .then(nodes => {
      return nodes.some(node => +node.value === +nodeId);
    })
    .then(valid => {
      return valid
        ? null
        : `The selected node(${nodeId}) doesn't have enough resources. CRU(${cru}) MRU(${mru}) SRU(${sru}) PublicIP(${publicIPs})`;
    })
    .catch(
      () =>
        `The selected node(${nodeId}) doesn't have enough resources. CRU(${cru}) MRU(${mru}) SRU(${sru}) PublicIP(${publicIPs})`,
    );
}
