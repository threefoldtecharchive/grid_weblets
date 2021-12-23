import type { IFormField } from "../types";

const NAME_REGEX = /^[a-z0-9]+$/i;

// prettier-ignore
export default function validateName(name: string): string | void {
    if (name.length === 0) return "Name must be at least 1 character";
    if (!NAME_REGEX.test(name)) return "Name can only include alphanumeric characters";
    if (name.length > 15) return "Name must be at most 15 characters";
}

export function isInvalid(fields: IFormField[]) {
  return fields.reduce((res, { invalid }) => res || !!invalid, false);
}

export function validateMemory(value: number): string | void {
  value = +value;
  if (isNaN(value)) return "Memory must be a valid number";
  if (+value.toFixed(0) !== value) return "Memory must be a valid integer";
  if (value < 250) return "Memory must be greater than 249 MB";
  if (value > 10 * 1024) return "Memory must be less than 10 GB";
}

export function validateDisk(value: number): string | void {
  value = +value;
  if (isNaN(value)) return "Disk must be a valid number";
  if (value <= 0) return "Disk must be greater than 0";
  if (value > 100) return "Disk must be less than 100 GB";
}

export function validateCpu(value: number): string | void {
  value = +value;
  if (isNaN(value)) return "CPU must be a valid number";
  if (+value.toFixed(0) !== value) return "CPU must be a valid integer";
  if (value <= 0) return "CPU must be greater than 0";
  if (value > 32) return "CPU must be less than 33 Cores";
}
