export default function rootFs(
  cpu_in_cores: number,
  memory_in_mb: number
): number {
  const x = (cpu_in_cores * (memory_in_mb / 1024)) / 8;
  return Math.max(x, 50);
}
