import type { IFormField } from "../types";

const NAME_REGEX = /^[a-z0-9]+$/i;
const EMAIL_REGEX = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
// prettier-ignore
export default function validateName(name: string): string | void {
    if (name.length === 0) return "Name must be at least 1 character";
    if (!NAME_REGEX.test(name)) return "Name can only include alphanumeric characters";
    if (name.length > 15) return "Name must be at most 15 characters";
}

export function validateEmail(email: string): string | void {
  if (!EMAIL_REGEX.test(email)) return "Invalid email format";
}

export function validateOptionalEmail(email: string): string | void {
  if (email == "") return null;
  if (!EMAIL_REGEX.test(email) ) return "Invalid email format";
}

export function isInvalid(fields: IFormField[]) {
  return fields.reduce((res, { invalid }) => res || !!invalid, false);
}

export function validateMemory(value: number): string | void {
  value = +value;
  if (isNaN(value)) return "Memory must be a valid number";
  if (+value.toFixed(0) !== value) return "Memory must be a valid integer";
  if (value < 250) return "Minimum allowed memory is 250 MB";
  if (value > 256 * 1024) return "Maximum allowed memory is 256 GB";
}

export function validateDisk(value: number): string | void {
  value = +value;
  if (isNaN(value)) return "Disk size must be a valid number";
  if (+value.toFixed(0) !== value) return "Disk size must be a valid integer";
  if (value < 1) return "Minimum allowed disk size is 1 GB";
  if (value > 10000) return "Maximum allowed disk size is 10000 GB";
}

export function validateCpu(value: number): string | void {
  value = +value;
  if (isNaN(value)) return "CPU must be a valid number";
  if (+value.toFixed(0) !== value) return "CPU cores must be a valid integer";
  if (value < 1) return "Minimum allowed CPU cores is 1";
  if (value > 32) return "Maximum allowed CPU cores is 32";
}
