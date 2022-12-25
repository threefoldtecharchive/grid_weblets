import type { NetworkEnv } from "grid3_client";
import type { IProfile } from "../types/Profile";

export default async function nodeExists(profile: IProfile, nodeId: number): Promise<boolean> {
  const { networkEnv } = profile;
  const grid = new window.configs.grid3_client.GridClient("" as unknown as NetworkEnv, "", "", null);

  const { rmbProxy } = grid.getDefaultUrls(networkEnv as unknown as NetworkEnv);
  return fetch(`${rmbProxy}/nodes/${nodeId}`, {
    method: "GET",
  })
    .then(res => {
      console.log(res);
      return res.status >= 200 && res.status < 400 ? true : false;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
}
