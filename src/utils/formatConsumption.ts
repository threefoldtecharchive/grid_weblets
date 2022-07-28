import { Decimal } from "decimal.js";

export default function formatConsumption(value: number): string {
  value = +value;
  if (isNaN(value) || value <= 0) return "No Data Available";
  return new Decimal(value).toFixed() + " TFT/hour";
}
