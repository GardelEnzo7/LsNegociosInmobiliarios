/**
 * Geocoding vía Nominatim (OpenStreetMap) — mismo ecosistema que los mapas
 * Leaflet ya usados en todo el sitio, sin API key ni cuenta de billing
 * (a diferencia de Google Geocoding). Pensado para uso puntual desde el
 * admin (un click por propiedad), no para volumen alto.
 */

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "LSNegociosInmobiliarios-Admin/1.0 (inmobiliariasenmache@gmail.com)";

export type GeocodeResult = { lat: number; lng: number; displayName: string };

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const params = new URLSearchParams({
    q: trimmed,
    format: "jsonv2",
    limit: "1",
    countrycodes: "ar",
  });

  let response: Response;
  try {
    response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "es-AR",
      },
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const results = (await response.json()) as { lat: string; lon: string; display_name: string }[];
  const first = results[0];
  if (!first) return null;

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng, displayName: first.display_name };
}
