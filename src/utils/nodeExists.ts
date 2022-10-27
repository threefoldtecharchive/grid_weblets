import type { ActiveProfile } from "../stores/activeProfile";

export default async function nodeExists(profile: ActiveProfile, nodeId:number) : Promise<boolean> {
  const { network } = profile;
  
  return fetch(`https://gridproxy.${network}.grid.tf/nodes/${nodeId}`, {
    method: "GET",
  })
    .then((res) => {console.log(res); return (res.status >= 200 && res.status < 400) ? true : false})
    .catch((err) => {console.log(err) ; return false});
}
