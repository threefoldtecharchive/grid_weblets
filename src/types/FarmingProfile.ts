export enum ProfileTypes {
  DIY,
  TITAN,
}

export enum Certification {
  NONE = 0,
  CERTIFIED = 1,
  GOLD_CERTIFIED = 2,
}

export interface FarmingProfileOptions {
  type: ProfileTypes;
  name: string;
  memory: number;
  cpu: number;
  hdd: number;
  ssd: number;
  price: number;
  priceAfter5Years: number;
  maximumTokenPrice: number;
  powerUtilization: number;
  powerCost: number;
  certified: Certification;
  publicIp: boolean;
  investmentCostHW: number;
  nuRequiredPerCu: number;
}

export default class FarmingProfile implements FarmingProfileOptions {
  public type: ProfileTypes = ProfileTypes.DIY;
  public name = "DIY";
  public memory = 0;
  public cpu = 0;
  public hdd = 0;
  public ssd = 0;
  public price = 0.09;
  public priceAfter5Years = 2;
  public maximumTokenPrice = 2;
  public powerUtilization = 40;
  public powerCost = 0.15;
  public certified: Certification = Certification.NONE;
  public publicIp = false;
  public investmentCostHW = 2200;
  public nuRequiredPerCu = 30;

  // prettier-ignore
  constructor(options: Partial<FarmingProfileOptions> = {}) {
    this.type = options.type || this.type;
    this.name = options.name || this.name;
    this.memory = options.memory || this.memory;
    this.cpu = options.cpu || this.cpu;
    this.hdd = options.hdd || this.hdd;
    this.ssd = options.ssd || this.ssd;
    this.price = options.price || this.price;
    this.priceAfter5Years = options.priceAfter5Years || this.priceAfter5Years;
    this.maximumTokenPrice = options.maximumTokenPrice || this.maximumTokenPrice;
    this.powerUtilization = options.powerUtilization || this.powerUtilization;
    this.powerCost = options.powerCost || this.powerCost;
    this.certified = options.certified || this.certified;
    this.publicIp = options.publicIp || this.publicIp;
    this.investmentCostHW = options.investmentCostHW || this.investmentCostHW;
    this.nuRequiredPerCu = options.nuRequiredPerCu || this.nuRequiredPerCu;
  }

  private _max(val: number, max = 0) {
    val = val ?? 0;
    return Math.max(val, max);
  }

  public get cu(): number {
    const { memory, cpu, ssd } = this;
    const x = (memory - 1) / 4;
    const y = cpu * 2;
    const z = ssd / 50;
    return this._max(Math.min(x, y, z));
  }

  public get nu(): number {
    return this._max(this.cu * this.nuRequiredPerCu);
  }

  public get su(): number {
    const { hdd, ssd } = this;

    const x = hdd / 1200;
    const y = ssd * 0.8;
    return x + y / 200;
  }

  public get averageTokenPrice(): number {
    const { price, priceAfter5Years } = this;
    return (price + priceAfter5Years) / 2;
  }

  public get rewardPerCu(): number {
    const { type, certified } = this;

    if (type === ProfileTypes.DIY) return 2.4;
    return 2.4 + 2.4 * certified * 0.25;
  }

  public get rewardPerSu(): number {
    const { type, certified } = this;

    if (type === ProfileTypes.DIY) return 1;
    return 1 + certified * 0.25;
  }

  public get rewardPerNu(): number {
    return 0.03;
  }

  private get tftRewardPer(): number {
    return (this.certified ? 1 : 0) * 0.25 + 1;
  }

  public get tftRewardPerCu(): number {
    const { rewardPerCu, price, tftRewardPer } = this;
    if (price < 0.08) return NaN;
    return (rewardPerCu / price) * tftRewardPer;
  }

  public get tftRewardPerSu(): number {
    const { rewardPerSu, price, tftRewardPer } = this;
    if (price < 0.08) return NaN;
    return (rewardPerSu / price) * tftRewardPer;
  }

  public get tftRewardPerNu(): number {
    const { rewardPerNu, averageTokenPrice } = this;
    return rewardPerNu / averageTokenPrice;
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
    const { cuFarmingRewardInTft, suFarmingRewardInTft, nuFarmingRewardInTft } = this;
    return cuFarmingRewardInTft + suFarmingRewardInTft + nuFarmingRewardInTft;
  }

  /* help functions for charts */
  public getTotalReward(current_price: number): number {
    const tft = this.totalFarmingRewardInTft * 60;
    const grossProfit = tft * current_price;
    return grossProfit - this.totalCosts;
  }

  public getRoi(price: number = this.priceAfter5Years): number {
    const { totalFarmingRewardInTft, investmentCostHW /* D38 */, powerUtilization, powerCost } = this; // prettier-ignore
    const tft = totalFarmingRewardInTft * 60;
    const usd /* D37 */ = tft * price;
    const powerCostOver5Years /* D33 */ = powerUtilization * 24 * .365 * 5 * powerCost; // prettier-ignore
    const roiX = usd - (investmentCostHW + powerCostOver5Years);
    const roiY = investmentCostHW + powerCostOver5Years;
    const roi = roiX / roiY;
    return roi * 100;
  }

  public get ROI(): string {
    return this.getRoi().toFixed(0) + "%";
  }

  public get grossProfit(): number {
    const tft = this.totalFarmingRewardInTft * 60;
    return tft * this.priceAfter5Years;
  }

  public get totalCosts(): number {
    const { powerUtilization, powerCost, price, investmentCostHW } = this;
    if (price < 0.08) return NaN;
    const powerCostOver5Years /* D33 */ = powerUtilization * 24 * .365 * 5 * powerCost; // prettier-ignore
    return powerCostOver5Years + investmentCostHW;
  }

  public get netProfit(): number {
    return this.grossProfit - this.totalCosts;
  }
}
