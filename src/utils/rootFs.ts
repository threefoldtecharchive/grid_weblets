import { Decimal } from "decimal.js";
import { validateCpu, validateMemory } from "./validateName";

const GB = 1024;

export default function rootFs(
  cpu_in_cores: number,
  mem_in_mb: number
): number {
  cpu_in_cores = !validateCpu(cpu_in_cores) ? +cpu_in_cores : 0;
  mem_in_mb = !validateMemory(mem_in_mb) ? +mem_in_mb : 0;

  const cu = new Decimal(cpu_in_cores)
    .mul(mem_in_mb)
    .divToInt(8 * GB)
    .toNumber();

  return cu === 0 ? 500 / GB : 2;
}
