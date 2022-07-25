import type { IProfile } from "../types/Profile";

export async function fetchCountries(profile: IProfile) : Promise<any> {
    const { networkEnv } = profile;
    return fetch(`https://gridproxy.${networkEnv}.grid.tf/stats?status=up`, {
      method: "GET",
    })
      .then(response => response.json())
      .then(response => response["nodesDistribution"])
      .catch((err) => {console.log(err) ; return err});
  }
