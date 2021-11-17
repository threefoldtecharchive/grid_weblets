export default class BaseConfig {
  public constructor(
    public url: string = "",
    public proxyURL: string = "https://rmbproxy1.devnet.grid.tf",
    public mnemonics: string = ""
  ) {}

  public get valid(): boolean {
    const { proxyURL, mnemonics, url } = this;
    return proxyURL !== "" && mnemonics !== "" && url !== "";
  }
}
