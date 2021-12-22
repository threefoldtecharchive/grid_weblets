export function build3DChart(notfs: number, investment: number, techmarket: number, tftprice: number) {
  // constants
  const MAX_NO_OF_TFS = 50; // D42
  const TFS_PRICE = 10; // C3 *
  const INCA_GENERATED_TFT_OVER_5Y = 18.6; // D43
  const NO_TFS = notfs //5000000; // D39 *
  const NO_INCA = NO_TFS; // D40
  const INVESTMENT = investment * 1e6 // 50 * 1000000; // C2 * 1000000

  // main values
  const techMarketCap /* B */ = Array.from({ length: 20 }, (_, i) => 100 + ((techmarket - 100) / 19) * i); // prettier-ignore * 5000
  const tftPrice /* C */ = Array.from({ length: 20 }, (_, i) => 0.15 + ((tftprice - 0.15) / 19) * i); // prettier-ignore * 4

  // values
  const tfs /* L */ = techMarketCap.map((b) => Math.max(b / MAX_NO_OF_TFS, TFS_PRICE)); // prettier-ignore
  const inca /* M */ = tftPrice.map((c) => c * INCA_GENERATED_TFT_OVER_5Y); // prettier-ignore
  const tfsIncome /* O */ = tfs.map((l) => l * NO_TFS);
  const incaIncome /* P */ = inca.map((m) => m * NO_INCA);
  const exit /* Q */ = tfsIncome.map((t, i) => t + incaIncome[i]);
  const multiple /* D */ = exit.map((q) => q / INVESTMENT);

  // To be drawn
  const x = techMarketCap.map((a) => +a.toFixed(3));
  const y = tftPrice.map((a) => +a.toFixed(3));
  const z = multiple.map((a) => +a.toFixed(3));

  return { x, y, z };
}