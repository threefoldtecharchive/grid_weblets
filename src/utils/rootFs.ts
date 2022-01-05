const GB = 1024;

export default function rootFs(
  cpu_in_cores: number,
  mem_in_mb: number
): number {
  const mem_in_gb = mem_in_mb / GB;
  const x = cpu_in_cores * mem_in_gb;
  const y = 8;

  const cu = x / y;

  if (cu === 0) return 500 / GB;
  return 2;
}
