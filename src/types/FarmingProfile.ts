export default class FarmingProfile {
  public constructor(
    public name: string = "Empty",
    public memory: number = 0,
    public cpu: number = 0,
    public hdd: number = 0,
    public ssd: number = 0,
    public price: number = 0,
    public priceAfter5Years: number = 0,
    public certified: boolean = true,
    public publicIp: boolean = true
  ) {}

  public get cu(): number {
    const { memory, cpu } = this;

    const x = (memory - 1) / 4;
    const y = (cpu * 4) / 2;
    return Math.min(x, y);
  }

  public get nu(): number {
    return this.cu * 30;
  }

  public get su(): number {
    const { hdd, ssd } = this;

    const x = hdd / 1200;
    const y = (ssd / 300) * 0.8;
    return x + y;
  }

  public get averageTokenPrice(): number {
    const { price, priceAfter5Years } = this;
    return (price + priceAfter5Years) / 2;
  }

  public get rewardPerCu(): number {
    return 2.4;
  }

  public get rewardPerSu(): number {
    return 1.5;
  }

  public get rewardPerNu(): number {
    return 0.03;
  }

  private get tftRewardPer(): number {
    return (this.certified ? 1 : 0) * 0.25 + 1;
  }

  public get tftRewardPerCu(): number {
    const { rewardPerCu, price, tftRewardPer } = this;
    return (rewardPerCu / price) * tftRewardPer;
  }

  public get tftRewardPerSu(): number {
    const { rewardPerSu, price, tftRewardPer } = this;
    return (rewardPerSu / price) * tftRewardPer;
  }

  public get tftRewardPerNu(): number {
    const { rewardPerNu, price } = this;
    return rewardPerNu / price;
  }

  public get cuFarmingRewardInTft(): number {
    const { cu, tftRewardPerCu } = this;
    return tftRewardPerCu * cu;
  }

  public get suFarmingRewardInTft(): number {
    const { su, tftRewardPerSu } = this;
    return tftRewardPerSu * su;
  }

  public get nuFarmingRewardInTft(): number {
    const { nu, tftRewardPerNu, publicIp } = this;
    return publicIp ? tftRewardPerNu * nu : 0;
  }

  public get totalFarmingRewardInTft(): number {
    const { cuFarmingRewardInTft, suFarmingRewardInTft, nuFarmingRewardInTft } =
      this;
    return cuFarmingRewardInTft + suFarmingRewardInTft + nuFarmingRewardInTft;
  }

  /* help functions for charts */
  private getCuFarmingRewardInTft(
    additionMemory: number = 0,
    in5Years: boolean = false
  ): number {
    const { memory, cpu, tftRewardPer, rewardPerCu, price, priceAfter5Years } =
      this;
    const tftRewardPerCu =
      (rewardPerCu / (in5Years ? priceAfter5Years : price)) * tftRewardPer;
    const x = (memory + additionMemory - 1) / 4;
    const y = (cpu * 4) / 2;
    const cu = Math.min(x, y);
    return tftRewardPerCu * cu;
  }

  private getSuFarmingRewardInTft(
    additionHdd: number = 0,
    in5Years: boolean = false
  ): number {
    const { hdd, ssd, tftRewardPer, rewardPerSu, price, priceAfter5Years } =
      this;
    const tftRewardPerSu =
      (rewardPerSu / (in5Years ? priceAfter5Years : price)) * tftRewardPer;
    const x = (hdd + additionHdd) / 1200;
    const y = (ssd / 300) * 0.8;
    const su = x + y;
    return tftRewardPerSu * su;
  }

  private getNuFarmingRewardInTft(
    additionMemory: number = 0,
    in5Years: boolean = false
  ): number {
    const { rewardPerNu, publicIp, price, priceAfter5Years } = this;
    const tftRewardPerNu = rewardPerNu / (in5Years ? priceAfter5Years : price);
    const nu = this.getCuFarmingRewardInTft(additionMemory) * 30;
    return publicIp ? tftRewardPerNu * nu : 0;
  }

  public get farmingReward() {
    const cu = this.getCuFarmingRewardInTft();
    const su = this.getSuFarmingRewardInTft();
    const nu = this.getNuFarmingRewardInTft();
    const total = cu + su + nu;
    return [cu, su, nu, total];
  }

  public get farmingReward1000() {
    const cu = this.getCuFarmingRewardInTft(1000);
    const su = this.getSuFarmingRewardInTft(1000);
    const nu = this.getNuFarmingRewardInTft(1000);
    const total = cu + su + nu;
    return [cu, su, nu, total];
  }

  public get farmingRewardIn5Years() {
    const cu = this.getCuFarmingRewardInTft(0, true);
    const su = this.getSuFarmingRewardInTft(0, true);
    const nu = this.getNuFarmingRewardInTft(0, true);
    const total = cu + su + nu;
    return [cu, su, nu, total];
  }

  public get farmingReward1000In5Years() {
    const cu = this.getCuFarmingRewardInTft(1000, true);
    const su = this.getSuFarmingRewardInTft(1000, true);
    const nu = this.getNuFarmingRewardInTft(1000, true);
    const total = cu + su + nu;
    return [cu, su, nu, total];
  }
}
