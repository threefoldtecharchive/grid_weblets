// prettier-ignore

export default function validatePassword(password: string): string | void {
  if (password.length < 6) return "Password must be at least 6 characters";
  if (password.length > 15) return "Password must be at most 15 characters";
}

