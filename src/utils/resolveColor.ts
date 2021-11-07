import type { Colors } from "../types";

type ResolveColorReturn = "is-primary" | "is-link" | "is-info" | "is-success" | "is-warning" | "is-danger" | "";
export default function resolveColor(color: Colors): ResolveColorReturn {
    switch (color) {
        case 'primary':
        case 'link':
        case 'info':
        case 'success':
        case 'warning':
        case 'danger':
            return `is-${color}`;

        default:
            return '';
    }
}