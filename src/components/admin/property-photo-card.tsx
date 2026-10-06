"use client";

import { memo } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconStar } from "@/components/site/icons";
import { IconGrip, IconStarOutline, IconTrash } from "@/components/admin/ui/icons";
import type { ImageItem } from "@/components/admin/property-images-manager";
import { buttonClass } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";

// Matches the grid's column widths (see PropertyImagesManager): one column
// on phones, then progressively more as the editor gets wider.
export const PHOTO_SIZES = "(min-width: 1536px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw";

const SORT_TRANSITION = { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" };

type Props = {
  item: ImageItem;
  index: number;
  total: number;
  disabled: boolean;
  onMakeCover: (key: string) => void;
  onRemove: (key: string) => void;
};

/**
 * One sortable photo. Its position is never stored here — `index` comes
 * straight from the manager's `items` array, which is the only client-side
 * representation of the order (index 0 = portada = position 0 once saved).
 *
 * The photo itself is the drag handle for mouse, touch and keyboard (it's
 * focusable; Space/Enter picks it up, arrows move it). The actions live
 * outside it, so clicking them never starts a drag.
 */
export const PropertyPhotoCard = memo(function PropertyPhotoCard({
  item,
  index,
  total,
  disabled,
  onMakeCover,
  onRemove,
}: Props) {
  const isCover = index === 0;
  const position = index + 1;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    disabled,
    transition: SORT_TRANSITION,
    attributes: { roleDescription: "foto ordenable" },
  });

  return (
    <li
      ref={setNodeRef}
      data-photo-key={item.key}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        // The handle's focus ring is drawn on the whole card: an inset ring
        // on the handle itself would be painted under the photo.
        "group/card relative flex flex-col overflow-hidden rounded-xl bg-blanco-roto ring-1 transition-shadow duration-200 ease-out has-[[data-focus=handle]:focus-visible]:outline-2 has-[[data-focus=handle]:focus-visible]:outline-offset-2 has-[[data-focus=handle]:focus-visible]:outline-petroleo-claro",
        item.status === "error" ? "ring-terracota/40" : isCover ? "ring-petroleo/30" : "ring-grafito/[0.08]",
        !disabled && !isDragging && "hover:shadow-[0_10px_28px_-18px_rgba(28,33,41,0.45)] hover:ring-grafito/15",
        // Placeholder left behind while the DragOverlay follows the pointer —
        // it slides into the slot the photo will land in.
        isDragging && "bg-piedra/30 ring-0 outline-2 outline-dashed outline-petroleo/40",
      )}
    >
      <div className={cn("flex flex-1 flex-col", isDragging && "opacity-0")}>
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          data-focus="handle"
          aria-label={`Foto ${position} de ${total}${isCover ? ", portada" : ""}`}
          className={cn(
            // `!`: the global (unlayered) :focus-visible outline in globals.css
            // would otherwise win and peek out under the photo.
            "group/handle relative aspect-[4/3] touch-manipulation select-none overflow-hidden bg-piedra [-webkit-touch-callout:none] focus-visible:outline-none!",
            disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
          )}
        >
          {item.previewUrl ? (
            <Image
              src={item.previewUrl}
              alt=""
              fill
              draggable={false}
              unoptimized={Boolean(item.file)}
              sizes={PHOTO_SIZES}
              className="pointer-events-none object-cover"
            />
          ) : null}

          {isCover ? (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-petroleo px-2 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.06em] text-blanco-roto">
              <IconStar className="h-2.5 w-2.5" />
              Portada
            </span>
          ) : null}

          {!disabled ? (
            <span
              aria-hidden="true"
              className="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blanco-roto/85 text-grafito/55 shadow-[0_1px_3px_rgba(28,33,41,0.18)] transition-colors duration-150 ease-out group-hover/card:bg-blanco-roto group-hover/card:text-grafito group-focus-visible/handle:bg-blanco-roto group-focus-visible/handle:text-petroleo"
            >
              <IconGrip className="h-4 w-4" />
            </span>
          ) : null}

          {/* Not uploaded yet — it only reaches Storage when the property is saved. */}
          {item.status === "idle" && item.file ? (
            <span className="absolute bottom-2.5 left-2.5 rounded-md bg-grafito/70 px-1.5 py-0.5 text-[10px] font-medium text-blanco-roto">
              Nueva
            </span>
          ) : null}

          {item.status === "uploading" ? (
            <span className="absolute inset-0 flex items-center justify-center bg-grafito/40">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-blanco-roto/40 border-t-blanco-roto" />
              <span className="sr-only">Subiendo foto {position}…</span>
            </span>
          ) : null}
        </div>

        {item.status === "error" ? (
          <p className="px-3 pt-2.5 text-xs leading-snug text-terracota">{item.error ?? "No se pudo subir."}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 px-1.5 py-1.5">
          {!isCover ? (
            <button
              type="button"
              onClick={() => onMakeCover(item.key)}
              disabled={disabled}
              aria-label={`Hacer portada la foto ${position}`}
              className={buttonClass("ghost", "sm", "gap-1.5")}
            >
              <IconStarOutline className="h-3.5 w-3.5" />
              Hacer portada
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onRemove(item.key)}
            disabled={disabled}
            aria-label={`Quitar foto ${position}`}
            className={buttonClass("danger", "sm", "ml-auto gap-1.5")}
          >
            <IconTrash className="h-3.5 w-3.5" />
            Quitar
          </button>
        </div>
      </div>
    </li>
  );
});

/** What follows the pointer/keyboard while dragging — the photo itself,
 * lifted, without the actions. */
export function PropertyPhotoDragPreview({ item }: { item: ImageItem }) {
  return (
    <div className="h-full cursor-grabbing overflow-hidden rounded-xl bg-blanco-roto shadow-[0_22px_44px_-18px_rgba(28,33,41,0.5)] ring-1 ring-grafito/10">
      <div className="relative aspect-[4/3] bg-piedra">
        {item.previewUrl ? (
          <Image
            src={item.previewUrl}
            alt=""
            fill
            draggable={false}
            unoptimized={Boolean(item.file)}
            sizes={PHOTO_SIZES}
            className="pointer-events-none object-cover"
          />
        ) : null}
        <span className="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blanco-roto text-grafito shadow-[0_1px_3px_rgba(28,33,41,0.18)]">
          <IconGrip className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
