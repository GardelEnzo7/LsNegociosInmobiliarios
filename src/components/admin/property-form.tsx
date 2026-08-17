"use client";

import { useActionState, useState } from "react";
import { createProperty, updateProperty, type PropertyFormState } from "@/app/actions/properties";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { Panel } from "@/components/admin/ui/panel";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";
import type { PropertyWithImages } from "@/lib/data/properties";

const initialState: PropertyFormState = {};

export function PropertyForm({ property }: { property?: PropertyWithImages }) {
  const action = property ? updateProperty.bind(null, property.id) : createProperty;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [images, setImages] = useState<string[]>(
    property?.property_images.map((img) => img.url) ?? [""],
  );

  return (
    <form action={formAction} className="space-y-4">
      <Panel title="Datos generales">
        <div className="space-y-4">
          <FormField label="Título" htmlFor="title">
            <input id="title" name="title" required defaultValue={property?.title} className={inputClass} />
          </FormField>
          <FormField label="Slug (URL)" htmlFor="slug">
            <input
              id="slug"
              name="slug"
              required
              defaultValue={property?.slug}
              placeholder="casa-fisherton-jardin"
              className={inputClass}
            />
          </FormField>
          <FormField label="Descripción" htmlFor="description">
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={property?.description}
              className={inputClass}
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
          <FormField label="Precio" htmlFor="price">
            <input id="price" name="price" type="number" min={0} required defaultValue={property?.price} className={inputClass} />
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Barrio / zona" htmlFor="neighborhood">
            <input id="neighborhood" name="neighborhood" required defaultValue={property?.neighborhood} className={inputClass} />
          </FormField>
          <FormField label="Dirección" htmlFor="address">
            <input id="address" name="address" defaultValue={property?.address ?? ""} className={inputClass} />
          </FormField>
        </div>
      </Panel>

      <Panel title="Características">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FormField label="M² totales" htmlFor="m2Total">
            <input id="m2Total" name="m2Total" type="number" min={0} defaultValue={property?.m2_total ?? ""} className={inputClass} />
          </FormField>
          <FormField label="M² cubiertos" htmlFor="m2Covered">
            <input id="m2Covered" name="m2Covered" type="number" min={0} defaultValue={property?.m2_covered ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Dormitorios" htmlFor="bedrooms">
            <input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={property?.bedrooms ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Baños" htmlFor="bathrooms">
            <input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={property?.bathrooms ?? ""} className={inputClass} />
          </FormField>
        </div>
      </Panel>

      <Panel title="Fotos (URLs)">
        <div className="space-y-2">
          {images.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input name="imageUrls" defaultValue={url} placeholder="https://..." className={inputClass} />
              <button
                type="button"
                onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                className="shrink-0 rounded-lg border border-grafito/10 px-3 text-sm text-grafito/60 transition-colors duration-150 ease-out hover:bg-piedra/40"
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

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-grafito px-6 py-3 text-sm font-medium text-blanco-roto transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Guardando…" : property ? "Guardar cambios" : "Publicar propiedad"}
      </button>
    </form>
  );
}
