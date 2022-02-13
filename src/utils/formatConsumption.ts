export default function formatConsumption(value: number): string {
  value = +value;
  if (isNaN(value) || value <= 0) return "No Data Available";
  return value.toString() + " TFT/hour";
}
