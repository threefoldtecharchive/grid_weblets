export default class BaseConfig {
  public constructor(
    public mnemonics: string = "",
    public storeSecret: string = "",
    public networkEnv: any = "dev" // 'test' | 'dev'
  ) {}

  public get valid(): boolean {
    const { mnemonics, storeSecret } = this;
    return mnemonics !== "" && storeSecret !== "";
  }

  // public static init() {
  // return Promise.all([web3Enable("Base Config"), web3Accounts()]).then(
  //   ([[{ signer }], [{ address }]]) => {
  //     new BaseConfig("", "", "test", address, signer);
  //   }
  // );
  // }
}
