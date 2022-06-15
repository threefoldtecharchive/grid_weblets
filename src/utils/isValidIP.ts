export function isValidIP(ip: string) {
  const IP_RANGE_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,3}$/;
  if (IP_RANGE_REGEX.test(ip)) return true;
  else {
    return false
  }
}

