export default function formatConsumption(value: number): string {
  value = +value;
  if (isNaN(value) || value <= 0) return "No Data Available";
  if (value < 1) return "Less than 1 TFT/Hour";
  return value.toFixed(3) + " TFT/Hour";
}
