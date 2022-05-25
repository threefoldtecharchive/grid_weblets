import type { IFormField } from "../types";

const PROFILE_NAME_REGEX = /^[\w\-\s]+$/;
const NAME_REGEX = /^[^0-9][a-zA-Z0-9]+$/;
const PRECODE_REGEX = /[a-zA-Z0-9]{32}$/;
const ALPHA_ONLY_REGEX = /[A-Za-z]/;
const EMAIL_REGEX = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
// prettier-ignore

export default function validateProfileName(name: string): string | void {
  if (name.length < 2) return "Name must be at least 2 characters";
  if (!ALPHA_ONLY_REGEX.test(name[0])) return "Name can't start with a number, a non-alphanumeric character or a whitespace";
  if (!PROFILE_NAME_REGEX.test(name)) return "Name can only include alphanumeric characters and spaces.";
  if (name.length > 15) return "Name must be at most 15 characters";
}

export function validateName(name: string): string | void {
  if (name.length < 2) return "Name must be at least 2 characters";
  if (!ALPHA_ONLY_REGEX.test(name[0])) return "Name can't start with a number, a non-alphanumeric character or a whitespace";
  if (!NAME_REGEX.test(name)) return "Name can only include alphanumeric characters.";
  if (name.length > 15) return "Name must be at most 15 characters";
}

export function validateEmail(email: string): string | void {
  if (!EMAIL_REGEX.test(email)) return "Invalid email format";
}

export function validateOptionalEmail(email: string): string | void {
  if (email == "") return null;
  if (!EMAIL_REGEX.test(email)) return "Invalid email format";
}

export function isInvalid(fields: IFormField[]) {
  return fields.reduce((res, { invalid }) => res || !!invalid, false);
  console.log("Validate method " + fields.reduce((res, { invalid }) => res || !!invalid, false))
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

export function validatePortNumber(value: string): string | void {
  if (value === "") return null;
  let port = +value;
  if (isNaN(port)) return "Port must be a valid number";
  if (port.toFixed(0) !== value) return "Port must be a valid integer";
  if (port < 1) return "Minimum allowed port is 1";
  if (port > 65535) return "Maximum allowed port is 65535";
}

export function validatePreCode(value: string): string | void {
  if (value === "") return "Presearch registration code is required";
  if (!PRECODE_REGEX.test(value)) return "Invalid presearch registration code";
  if (value.length !== 32) return "Presearch registration code must be 32 characters long";
}

export function validatePassword(value: string): string | void {
  if (value.length < 6) return "Password must be at least 6 characters";
  if (value.length > 15) return "Password must be less than 15 characters";

}