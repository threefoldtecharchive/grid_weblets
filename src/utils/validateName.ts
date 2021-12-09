const NAME_REGEX = /^[a-z0-9]+$/i;

// prettier-ignore
export default function validateName(name: string): string | void {
    if (name.length === 0) return "Name must be at least 1 character";
    if (!NAME_REGEX.test(name)) return "Name can only include alphanumeric characters";
    if (name.length > 15) return "Name must be at most 15 characters";
}
