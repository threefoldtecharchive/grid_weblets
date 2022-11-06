import type { IProfile } from "../types/Profile";

export async function fetchCountries(profile: IProfile) : Promise<any> {
    const { networkEnv } = profile;
    const grid = new window.configs.grid3_client.GridClient(
      "" as any,
      "",
      "",
      null
    );
  
    const { rmbProxy } = grid.getDefaultUrls(networkEnv as any );
  
    return fetch(`${rmbProxy}/stats?status=up`, {
      method: "GET",
    })
      .then(response => response.json())
      .then(response => response["nodesDistribution"])
      .catch((err) => {console.log(err) ; return err});
  }
