interface IMattermost {
  username: string;
  password: string;
  dbUsername: string;
}

export default class Mattermost implements IMattermost {
  public username: string;
  public password: string;
  public dbUsername: string;

  public constructor({
    username,
    password,
    dbUsername,
  }: Partial<IMattermost> = {}) {
    this.username = username || "";
    this.password = password || "";
    this.dbUsername = dbUsername || "";
  }

  get invalid(): boolean {
    const { username, password, dbUsername } = this;
    return (
      username.trim() === "" ||
      password.trim() === "" ||
      dbUsername.trim() === ""
    );
  }
}
