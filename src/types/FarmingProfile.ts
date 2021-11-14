export default class FarmingProfile {
  public constructor(
    public memory: number /* GB */,
    public cpu: number /* Cores */,
    public hdd: number /* GB */,
    public ssd: number /* GB */,
    public price: number /* USD */,
    public priceAfter5Years: number /* USD */,
    public rewardPerCu: number /* USD */,
    public rewardPerSu: number /* USD */,
    public rewardPerNu: number /* USD */
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

  public get tftRewardPerCu(): number {
    const { rewardPerCu, price } = this;
    return (rewardPerCu / price) * 1.25;
  }

  public get tftRewardPerSu(): number {
    const { rewardPerSu, price } = this;
    return (rewardPerSu / price) * 1.25;
  }

  public get tftRewardPerNu(): number {
    const { rewardPerNu, price } = this;
    return rewardPerNu / price;
  }
}
