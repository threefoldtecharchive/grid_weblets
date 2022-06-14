export function isValidIP(ip: string) {
  const IP_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,3}$/;
  if (!IP_REGEX.test(ip)) return false;
  else {
    return true
  }
}

