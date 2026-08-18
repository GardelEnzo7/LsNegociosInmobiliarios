import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: "USD" | "ARS" = "USD") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Serializes a value for a JSON-LD <script> tag, escaping "<" so user-entered
 * content (e.g. a property description) can never break out of the script context. */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Splits free-form copy into paragraphs on blank lines, trimming each one
 * and dropping empties — used to render a single stored bio/text field as
 * multiple <p> blocks instead of one run-on paragraph. */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Lowercase, accent-free, hyphen-separated slug — e.g.
 * `slugify("Casa en Abasto - Ocampo 1502")` -> `"casa-en-abasto-ocampo-1502"`.
 * Used to auto-suggest a property's URL slug from its title. */
// Combining diacritical marks (U+0300-U+036F), stripped after NFD
// normalization splits e.g. "á" into "a" + a combining acute accent.
const DIACRITICS_RANGE = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(DIACRITICS_RANGE, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
