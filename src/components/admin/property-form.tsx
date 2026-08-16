"use client";

import { useActionState, useState } from "react";
import { createProperty, updateProperty, type PropertyFormState } from "@/app/actions/properties";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { PropertyWithImages } from "@/lib/data/properties";

const initialState: PropertyFormState = {};

export function PropertyForm({ property }: { property?: PropertyWithImages }) {
  const action = property ? updateProperty.bind(null, property.id) : createProperty;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [images, setImages] = useState<string[]>(
    property?.property_images.map((img) => img.url) ?? [""],
  );

  return (
    <form action={formAction} className="space-y-8">
      <Section title="Datos generales">
        <Field label="Título">
          <input name="title" required defaultValue={property?.title} className={inputClass} />
        </Field>
        <Field label="Slug (URL)">
          <input
            name="slug"
            required
            defaultValue={property?.slug}
            placeholder="casa-fisherton-jardin"
            className={inputClass}
          />
        </Field>
        <Field label="Descripción">
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={property?.description}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Operación">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Operación">
            <select name="operation" defaultValue={property?.operation ?? "venta"} className={inputClass}>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </Field>
          <Field label="Tipo de propiedad">
            <select name="propertyType" defaultValue={property?.property_type ?? "casa"} className={inputClass}>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Precio">
            <input
              name="price"
              type="number"
              min={0}
              required
              defaultValue={property?.price}
              className={inputClass}
            />
          </Field>
          <Field label="Moneda">
            <select name="currency" defaultValue={property?.currency ?? "USD"} className={inputClass}>
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Ubicación">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Barrio / zona">
            <input name="neighborhood" required defaultValue={property?.neighborhood} className={inputClass} />
          </Field>
          <Field label="Dirección">
            <input name="address" defaultValue={property?.address ?? ""} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Características">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="M² totales">
            <input name="m2Total" type="number" min={0} defaultValue={property?.m2_total ?? ""} className={inputClass} />
          </Field>
          <Field label="M² cubiertos">
            <input name="m2Covered" type="number" min={0} defaultValue={property?.m2_covered ?? ""} className={inputClass} />
          </Field>
          <Field label="Dormitorios">
            <input name="bedrooms" type="number" min={0} defaultValue={property?.bedrooms ?? ""} className={inputClass} />
          </Field>
          <Field label="Baños">
            <input name="bathrooms" type="number" min={0} defaultValue={property?.bathrooms ?? ""} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Fotos (URLs)">
        <div className="space-y-2">
          {images.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                name="imageUrls"
                defaultValue={url}
                placeholder="https://..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                className="shrink-0 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-500 transition-colors duration-150 ease-out hover:bg-zinc-100"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setImages((current) => [...current, ""])}
          className="mt-2 text-sm font-medium text-petroleo hover:underline"
        >
          + Agregar foto
        </button>
      </Section>

      <Section title="Publicación">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Estado del sitio">
            <select name="status" defaultValue={property?.status ?? "published"} className={inputClass}>
              <option value="published">Publicada</option>
              <option value="draft">Borrador</option>
            </select>
          </Field>
          <Field label="Estado de la operación">
            <select name="availability" defaultValue={property?.availability ?? "disponible"} className={inputClass}>
              <option value="disponible">Disponible</option>
              <option value="reservada">Reservada</option>
              <option value="vendida">Vendida</option>
              <option value="alquilada">Alquilada</option>
            </select>
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={property?.featured ?? false}
            className="h-4 w-4 rounded border-zinc-300 text-petroleo focus:ring-petroleo"
          />
          Marcar como destacada en la home
        </label>
      </Section>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-grafito px-6 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Guardando…" : property ? "Guardar cambios" : "Crear propiedad"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors duration-200 ease-out focus:border-petroleo";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-600">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
