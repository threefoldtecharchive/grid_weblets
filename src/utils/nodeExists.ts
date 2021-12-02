import type { IProfile } from "../types/Profile";

export default async function nodeExists(profile: IProfile, nodeId:number) : Promise<boolean> {
  const { networkEnv } = profile;
  
  return fetch(`gridproxy.${networkEnv}.grid.tf/nodes/${nodeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(() => true)
    .catch(() => false);
}
