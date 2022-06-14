export function isValidWorkerName(name: string) {
  const ALPHA_ONLY_REGEX = /[A-Za-z]/; // Alphabets only
  const NAME_REGEX = /^[^0-9][a-zA-Z0-9]+$/; // Alphabets + digits + not start with digit
  const NO_SPACE_REGEX = /^\S*$/;
  if (!ALPHA_ONLY_REGEX.test(name[0]) || (!NAME_REGEX.test(name)) || (!NO_SPACE_REGEX.test(name)) || name.length < 2 || name.length > 15) {
    return false;
  }
  else {
    return true;
  }
}