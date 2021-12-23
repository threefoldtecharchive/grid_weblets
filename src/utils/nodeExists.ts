import type { IProfile } from "../types/Profile";

export default async function nodeExists(profile: IProfile, nodeId:number) : Promise<boolean> {
  const { networkEnv } = profile;
  
  return fetch(`https://gridproxy.${networkEnv}.grid.tf/nodes/${nodeId}`, {
    method: "GET",
  })
    .then((res) => {console.log(res); return (res.status >= 200 && res.status < 400) ? true : false})
    .catch((err) => {console.log(err) ; return false});
}
