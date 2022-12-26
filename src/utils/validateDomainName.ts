// regex patter for validating domain name
const DOMAIN_NAME_REGEX = /^\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b$/;

// prettier-ignore
export default function validateDomainName(domain: string): string | void {
    // for optional fields to work
    if (domain === "") return null;
    if (!DOMAIN_NAME_REGEX.test(domain)) return "Domain name is not valid";
}

export function validateRequiredHostName(domain: string): string | void {
  // for optional fields to work
  if (domain === "") return "Host name is required";
  if (!DOMAIN_NAME_REGEX.test(domain)) return "Host name is not valid";
}
