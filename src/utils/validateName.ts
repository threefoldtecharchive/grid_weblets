// prettier-ignore
export default function validateName(name: string): string | void {
    if (!name.match(/[0-9]/g)) return "Name must include at least 1 number";
    if (!name.match(/[a-z]/gi)) return "Name must include letters";
    if (name.length < 6) return "Name must be at least 6 chars";
    if (name.length > 15) return "Name must be at most 15 chars";
}
