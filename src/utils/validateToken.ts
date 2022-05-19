const ALPHA_NUMS_ONLY_REGEX = /^\w+$/;

// prettier-ignore

export default function validateToken(token: string): string | void {
  if (token.length < 6) return "Token must be at least 6 characters";
  if (!ALPHA_NUMS_ONLY_REGEX.test(token)) return "Token can't contain any characters other than alphabets and numbers.";
  if (token.length > 15) return "Token must be at most 15 characters";
}

