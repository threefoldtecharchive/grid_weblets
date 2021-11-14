const REWARD_RATIO = 0.15;

export default class FarmingProfile {
  public constructor(
    public name: string = "Empty Profile",
    public memory: number = 0 /* GB */,
    public cpu: number = 0 /* Cores */,
    public hdd: number = 0 /* GB */,
    public ssd: number = 0 /* GB */,
    public price: number = 0 /* USD */,
    public priceAfter5Years: number = 0 /* USD */,
    public rewardPerCu: number = 0 /* USD */,
    public rewardPerSu: number = 0 /* USD */,
    public rewardPerNu: number = 0 /* USD */
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

  public get rewardPerCuValue(): number {
    return this.rewardPerCu * REWARD_RATIO;
  }

  public get rewardPerSuValue(): number {
    return this.rewardPerSu * REWARD_RATIO;
  }

  public get rewardPerNuValue(): number {
    return this.rewardPerNu * REWARD_RATIO;
  }

  public get tftRewardPerCu(): number {
    const { rewardPerCuValue, price } = this;
    return (rewardPerCuValue / price) * 1.25;
  }

  public get tftRewardPerSu(): number {
    const { rewardPerSuValue, price } = this;
    return (rewardPerSuValue / price) * 1.25;
  }

  public get tftRewardPerNu(): number {
    const { rewardPerNuValue, price } = this;
    return rewardPerNuValue / price;
  }
}
