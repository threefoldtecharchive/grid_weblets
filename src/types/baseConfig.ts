export default class BaseConfig {
  public constructor(
    public mnemonics: string = "",
    public storeSecret: string = "",
    public networkEnv: any = "test" // 'test' | 'dev'
  ) {}

  public get valid(): boolean {
    const { mnemonics, storeSecret } = this;
    return mnemonics !== "" && storeSecret !== "";
  }
}
