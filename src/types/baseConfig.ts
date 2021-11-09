export default class BaseConfig {
  public constructor(
    public url: string = "wss://tfchain.test.threefold.io/ws",
    public proxyURL: string = "https://rmbproxy1.testnet.grid.tf",
    public mnemonics: string = ""
  ) {}

  public get valid(): boolean {
    const { proxyURL, mnemonics, url } = this;
    return proxyURL !== "" && mnemonics !== "" && url !== "";
  }
}
