"use client";

import { useId, useState, useTransition } from "react";
import { geocodePropertyAddress } from "@/app/actions/geocode";
import { FormField, inputClass } from "@/components/admin/ui/form-field";
import { cn } from "@/lib/utils";

export function PropertyLocationFields({
  initialAddress,
  initialNeighborhood,
  initialLat,
  initialLng,
  disabled,
  fieldMessages,
}: {
  initialAddress: string;
  initialNeighborhood: string;
  initialLat: number | null;
  initialLng: number | null;
  disabled?: boolean;
  fieldMessages?: { neighborhood?: string; address?: string; lat?: string; lng?: string };
}) {
  const [lat, setLat] = useState(initialLat != null ? String(initialLat) : "");
  const [lng, setLng] = useState(initialLng != null ? String(initialLng) : "");
  const [feedback, setFeedback] = useState<{ tone: "found" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const addressId = useId();
  const neighborhoodId = useId();

  function handleSearch() {
    const address = (document.getElementById(addressId) as HTMLInputElement | null)?.value ?? "";
    const neighborhood = (document.getElementById(neighborhoodId) as HTMLInputElement | null)?.value ?? "";

    if (!address.trim() && !neighborhood.trim()) {
      setFeedback({ tone: "error", text: "Escribí al menos la dirección o el barrio para poder buscar." });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await geocodePropertyAddress(address, neighborhood);
        if (!result) {
          setFeedback({
            tone: "error",
            text: "No encontramos esa dirección en el mapa. Podés cargar las coordenadas a mano abajo.",
          });
          return;
        }
        setLat(String(result.lat));
        setLng(String(result.lng));
        setFeedback({ tone: "found", text: `Ubicación encontrada: ${result.displayName}` });
      } catch {
        setFeedback({ tone: "error", text: "No se pudo buscar la ubicación. Intentá de nuevo." });
      }
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Barrio / zona" htmlFor={neighborhoodId} error={fieldMessages?.neighborhood}>
        <input
          id={neighborhoodId}
          name="neighborhood"
          required
          defaultValue={initialNeighborhood}
          aria-invalid={Boolean(fieldMessages?.neighborhood)}
          className={cn(inputClass, fieldMessages?.neighborhood && "border-terracota focus:border-terracota")}
        />
      </FormField>
      <FormField label="Dirección" htmlFor={addressId} error={fieldMessages?.address}>
        <input
          id={addressId}
          name="address"
          defaultValue={initialAddress}
          aria-invalid={Boolean(fieldMessages?.address)}
          className={cn(inputClass, fieldMessages?.address && "border-terracota focus:border-terracota")}
        />
      </FormField>

      <div className="sm:col-span-2">
        <button
          type="button"
          onClick={handleSearch}
          disabled={disabled || isPending}
          className="rounded-lg border border-grafito/10 px-4 py-2 text-sm font-medium text-grafito transition-colors duration-150 ease-out hover:bg-piedra/40 disabled:opacity-50"
        >
          {isPending ? "Buscando…" : "Buscar ubicación en el mapa"}
        </button>
        {feedback ? (
          <p className={`mt-2 text-xs ${feedback.tone === "error" ? "text-terracota" : "text-petroleo"}`}>
            {feedback.text}
          </p>
        ) : (
          <p className="mt-2 font-body text-xs text-grafito/45">
            Busca la dirección + barrio en el mapa y completa lat/lng automáticamente. Siempre podés corregirlas a mano.
          </p>
        )}
      </div>

      <FormField label="Latitud" htmlFor="lat" error={fieldMessages?.lat}>
        <input
          id="lat"
          name="lat"
          type="number"
          step="any"
          min={-90}
          max={90}
          value={lat}
          onChange={(event) => setLat(event.target.value)}
          disabled={disabled}
          placeholder="-32.9468"
          aria-invalid={Boolean(fieldMessages?.lat)}
          className={cn(inputClass, fieldMessages?.lat && "border-terracota focus:border-terracota")}
        />
      </FormField>
      <FormField label="Longitud" htmlFor="lng" error={fieldMessages?.lng}>
        <input
          id="lng"
          name="lng"
          type="number"
          step="any"
          min={-180}
          max={180}
          value={lng}
          onChange={(event) => setLng(event.target.value)}
          disabled={disabled}
          placeholder="-60.6393"
          aria-invalid={Boolean(fieldMessages?.lng)}
          className={cn(inputClass, fieldMessages?.lng && "border-terracota focus:border-terracota")}
        />
      </FormField>
    </div>
  );
}
