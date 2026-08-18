"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPropertyAction,
  updatePropertyAction,
  syncPropertyImages,
  finalizePropertyPublish,
  type PropertyFormState,
} from "@/app/actions/properties";
import { ORIENTATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { Panel } from "@/components/admin/ui/panel";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";
import { PropertyImagesManager, type PropertyImagesManagerHandle } from "@/components/admin/property-images-manager";
import { PropertyLocationFields } from "@/components/admin/property-location-fields";
import type { PropertyWithImages } from "@/lib/data/properties";
import { cn, slugify } from "@/lib/utils";

const initialState: PropertyFormState = {};

export function PropertyForm({ property }: { property?: PropertyWithImages }) {
  const action = property ? updatePropertyAction.bind(null, property.id) : createPropertyAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const router = useRouter();
  const imagesRef = useRef<PropertyImagesManagerHandle>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  // Slug auto-generation: mirrors the title until the admin edits the slug
  // by hand, at which point we stop touching it — editing an existing
  // property's slug is treated as already "customized" from the start so a
  // title tweak never silently changes a live URL.
  const [slug, setSlug] = useState(property?.slug ?? "");
  const slugEditedRef = useRef(Boolean(property));

  // Base property fields are saved by the server action above. Once that
  // succeeds we know the property id and switch to the client-driven step:
  // upload any new photos straight to Supabase Storage (bytes never touch
  // the Netlify function), then persist their URLs as property_images rows,
  // then navigate away. This effect re-runs on every successful submission
  // (each one produces a new `state` object), covering both create and edit.
  useEffect(() => {
    if (!state.propertyId) return;
    let cancelled = false;

    (async () => {
      setFinalizeError(null);
      setFinalizing(true);
      try {
        const images = await imagesRef.current!.commit(state.propertyId!);
        if (cancelled) return;

        const result = await syncPropertyImages(state.propertyId!, images);
        if (cancelled) return;
        if (result.error) {
          setFinalizeError(result.error);
          setFinalizing(false);
          return;
        }

        // New property, created as draft (see savePropertyBase): now that
        // photos are safely synced, promote it to what the admin actually
        // asked for. If that fails, land on the edit page instead of the
        // list — the draft and its photos are intact, ready to retry.
        if (!property && state.intendedStatus === "published") {
          const publishResult = await finalizePropertyPublish(state.propertyId!, "published");
          if (cancelled) return;
          if (publishResult.error) {
            router.push(`/admin/propiedades/${state.propertyId}`);
            router.refresh();
            return;
          }
        }

        router.push("/admin/propiedades");
        router.refresh();
      } catch {
        if (!cancelled) {
          setFinalizeError("No se pudieron guardar las fotos.");
          setFinalizing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Server-side validation (zod, in `savePropertyBase`) stays authoritative
  // — this only reflects its result back onto the exact input that failed,
  // without ever losing what the admin already typed (the form never
  // unmounts/resets on a failed submission, so every other field's value —
  // and any staged photos — survive as-is).
  const fieldMessage = (key: string) => state.fieldMessages?.[key];
  const fieldInputClass = (key: string, base = inputClass) =>
    cn(base, fieldMessage(key) && "border-terracota focus:border-terracota");

  return (
    <form action={formAction} className="space-y-4">
      <Panel title="Datos generales">
        <div className="space-y-4">
          <FormField label="Título" htmlFor="title" error={fieldMessage("title")}>
            <input
              id="title"
              name="title"
              required
              defaultValue={property?.title}
              onChange={(event) => {
                if (!slugEditedRef.current) setSlug(slugify(event.target.value));
              }}
              aria-invalid={Boolean(fieldMessage("title"))}
              className={fieldInputClass("title")}
            />
          </FormField>
          <FormField label="Slug (URL)" htmlFor="slug" error={fieldMessage("slug")}>
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(event) => {
                slugEditedRef.current = true;
                setSlug(event.target.value);
              }}
              placeholder="casa-fisherton-jardin"
              aria-invalid={Boolean(fieldMessage("slug"))}
              className={fieldInputClass("slug")}
            />
          </FormField>
          <FormField label="Descripción" htmlFor="description" error={fieldMessage("description")}>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={property?.description}
              aria-invalid={Boolean(fieldMessage("description"))}
              className={fieldInputClass("description")}
            />
          </FormField>
        </div>
      </Panel>

      <Panel title="Operación">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Operación" htmlFor="operation">
            <SelectShell>
              <select id="operation" name="operation" defaultValue={property?.operation ?? "venta"} className={selectClass}>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Tipo de propiedad" htmlFor="propertyType">
            <SelectShell>
              <select id="propertyType" name="propertyType" defaultValue={property?.property_type ?? "casa"} className={selectClass}>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Precio" htmlFor="price" error={fieldMessage("price")}>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              required
              defaultValue={property?.price}
              aria-invalid={Boolean(fieldMessage("price"))}
              className={fieldInputClass("price")}
            />
          </FormField>
          <FormField label="Moneda" htmlFor="currency">
            <SelectShell>
              <select id="currency" name="currency" defaultValue={property?.currency ?? "USD"} className={selectClass}>
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </SelectShell>
          </FormField>
        </div>
      </Panel>

      <Panel title="Ubicación">
        <PropertyLocationFields
          initialAddress={property?.address ?? ""}
          initialNeighborhood={property?.neighborhood ?? ""}
          initialLat={property?.lat ?? null}
          initialLng={property?.lng ?? null}
          disabled={pending}
          fieldMessages={{
            neighborhood: fieldMessage("neighborhood"),
            address: fieldMessage("address"),
            lat: fieldMessage("lat"),
            lng: fieldMessage("lng"),
          }}
        />
      </Panel>

      <Panel title="Características">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FormField label="M² totales" htmlFor="m2Total">
            <input id="m2Total" name="m2Total" type="number" min={0} defaultValue={property?.m2_total ?? ""} className={inputClass} />
          </FormField>
          <FormField label="M² cubiertos" htmlFor="m2Covered">
            <input id="m2Covered" name="m2Covered" type="number" min={0} defaultValue={property?.m2_covered ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Ambientes" htmlFor="rooms">
            <input id="rooms" name="rooms" type="number" min={1} defaultValue={property?.rooms ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Dormitorios" htmlFor="bedrooms">
            <input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={property?.bedrooms ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Baños" htmlFor="bathrooms">
            <input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={property?.bathrooms ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Año de construcción" htmlFor="yearBuilt" error={fieldMessage("yearBuilt")}>
            <input
              id="yearBuilt"
              name="yearBuilt"
              type="number"
              min={1800}
              max={2100}
              defaultValue={property?.year_built ?? ""}
              aria-invalid={Boolean(fieldMessage("yearBuilt"))}
              className={fieldInputClass("yearBuilt")}
            />
          </FormField>
          <FormField label="Expensas (ARS/mes)" htmlFor="expenses" error={fieldMessage("expenses")}>
            <input
              id="expenses"
              name="expenses"
              type="number"
              min={0}
              defaultValue={property?.expenses ?? ""}
              aria-invalid={Boolean(fieldMessage("expenses"))}
              className={fieldInputClass("expenses")}
            />
          </FormField>
          <FormField label="Orientación" htmlFor="orientation">
            <SelectShell>
              <select id="orientation" name="orientation" defaultValue={property?.orientation ?? ""} className={selectClass}>
                <option value="">Sin especificar</option>
                {Object.entries(ORIENTATION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          <label className="flex items-center gap-2 text-sm text-grafito/70">
            <input
              type="checkbox"
              name="hasGarage"
              defaultChecked={property?.has_garage ?? false}
              className="h-4 w-4 rounded border-grafito/15 text-petroleo focus:ring-petroleo"
            />
            Cochera
          </label>
          <label className="flex items-center gap-2 text-sm text-grafito/70">
            <input
              type="checkbox"
              name="creditEligible"
              defaultChecked={property?.credit_eligible ?? false}
              className="h-4 w-4 rounded border-grafito/15 text-petroleo focus:ring-petroleo"
            />
            Apto crédito
          </label>
          <label className="flex items-center gap-2 text-sm text-grafito/70">
            <input
              type="checkbox"
              name="professionalUse"
              defaultChecked={property?.professional_use ?? false}
              className="h-4 w-4 rounded border-grafito/15 text-petroleo focus:ring-petroleo"
            />
            Apto profesional
          </label>
        </div>
      </Panel>

      <Panel title="SEO de la propiedad (opcional)">
        <div className="space-y-4">
          <FormField label="Título SEO (máx. 70 caracteres)" htmlFor="metaTitle" error={fieldMessage("metaTitle")}>
            <input
              id="metaTitle"
              name="metaTitle"
              maxLength={70}
              defaultValue={property?.meta_title ?? ""}
              aria-invalid={Boolean(fieldMessage("metaTitle"))}
              className={fieldInputClass("metaTitle")}
            />
          </FormField>
          <FormField
            label="Descripción SEO (máx. 160 caracteres)"
            htmlFor="metaDescription"
            error={fieldMessage("metaDescription")}
          >
            <textarea
              id="metaDescription"
              name="metaDescription"
              rows={2}
              maxLength={160}
              defaultValue={property?.meta_description ?? ""}
              aria-invalid={Boolean(fieldMessage("metaDescription"))}
              className={fieldInputClass("metaDescription")}
            />
          </FormField>
          <p className="font-body text-xs text-grafito/45">
            Si se dejan vacíos, se genera automáticamente un título y descripción a partir de los datos de la propiedad.
          </p>
        </div>
      </Panel>

      <Panel title="Fotos">
        <PropertyImagesManager
          ref={imagesRef}
          initialImages={property?.property_images.map((img) => ({ id: img.id, url: img.url, alt: img.alt })) ?? []}
          disabled={pending}
        />
      </Panel>

      <Panel title="Publicación">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Estado del sitio" htmlFor="status">
            <SelectShell>
              <select id="status" name="status" defaultValue={property?.status ?? "published"} className={selectClass}>
                <option value="published">Publicada</option>
                <option value="draft">Borrador</option>
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Estado de la operación" htmlFor="availability">
            <SelectShell>
              <select id="availability" name="availability" defaultValue={property?.availability ?? "disponible"} className={selectClass}>
                <option value="disponible">Disponible</option>
                <option value="reservada">Reservada</option>
                <option value="vendida">Vendida</option>
                <option value="alquilada">Alquilada</option>
              </select>
            </SelectShell>
          </FormField>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-grafito/70">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={property?.featured ?? false}
            className="h-4 w-4 rounded border-grafito/15 text-petroleo focus:ring-petroleo"
          />
          Marcar como destacada en la home
        </label>
      </Panel>

      {state.error ? <p className="text-sm text-terracota">{state.error}</p> : null}
      {finalizeError ? <p className="text-sm text-terracota">{finalizeError}</p> : null}

      <button
        type="submit"
        disabled={pending || finalizing}
        className="rounded-lg bg-grafito px-6 py-3 text-sm font-medium text-blanco-roto transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Guardando…" : finalizing ? "Guardando fotos…" : property ? "Guardar cambios" : "Publicar propiedad"}
      </button>
    </form>
  );
}
