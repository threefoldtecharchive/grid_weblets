import { Decimal } from "decimal.js";

const GB = 1024;

export default function rootFs(
  cpu_in_cores: number,
  mem_in_mb: number
): number {
  const cu = new Decimal(cpu_in_cores)
    .mul(mem_in_mb)
    .divToInt(8 * GB)
    .toNumber();

  return cu === 0 ? 500 / GB : 2;
}
