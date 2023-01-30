import VM from "./vm";

export default class WP extends VM {
  public name = `WP${this.id}`;
  public username = "admin";
  public password = "password";
  public email = "";
  public domain = "";
}
