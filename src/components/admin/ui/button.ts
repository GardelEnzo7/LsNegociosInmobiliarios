import { cn } from "@/lib/utils";

/**
 * The admin's one set of action styles — shared by <button>, <Link> and
 * file-picker <label>s alike, so equivalent actions always look the same:
 *
 * - primary: the single main action of a form/page (Guardar, Publicar…).
 * - secondary: outlined, for supporting actions next to a primary one.
 * - ghost: quiet inline actions in cards/rows (Editar, Ver, Hacer portada).
 * - danger: quiet destructive actions (Eliminar, Quitar) — terracota text,
 *   never a big red block; confirmation dialogs carry the solid version.
 * - dangerSolid: the confirm button of a destructive dialog only.
 *
 * Focus is the global :focus-visible ring from globals.css.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerSolid";
export type ButtonSize = "md" | "sm";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-grafito text-blanco-roto hover:bg-grafito-dark active:scale-[0.98]",
  secondary: "border border-grafito/12 bg-blanco-roto text-grafito hover:border-grafito/25 hover:bg-plata",
  ghost: "text-grafito/65 hover:bg-piedra/40 hover:text-grafito",
  danger: "text-terracota/85 hover:bg-terracota/[0.07] hover:text-terracota",
  dangerSolid: "bg-terracota text-blanco-roto hover:bg-terracota/90 active:scale-[0.98]",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-sm",
  sm: "h-8 px-2.5 text-xs",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}
