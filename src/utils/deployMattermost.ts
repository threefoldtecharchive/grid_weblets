import type Mattermost from "../types/mattermost";
import type { IProfile } from "../types/Profile";

export default function deployMattermost(
  profile: IProfile,
  mattermost: Mattermost
) {
  const { username, dbUsername, password } = mattermost;
}
