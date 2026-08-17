"use client";

import "leaflet/dist/leaflet.css";
import Image from "next/image";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { PropertyWithImages } from "@/lib/data/properties";
import { OPERATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { markerIcon } from "@/components/site/leaflet-marker-icon";
import { formatPrice } from "@/lib/utils";
import { IconArea, IconBed, IconPin } from "@/components/site/icons";

/** typeof check (not truthy) so a legitimate 0 lat/lng never gets treated
 * as "missing" — irrelevant in Rosario in practice, but cheap to get right. */
function hasCoordinates(p: PropertyWithImages): p is PropertyWithImages & { lat: number; lng: number } {
  return typeof p.lat === "number" && typeof p.lng === "number";
}

export function PropertiesMap({ properties }: { properties: PropertyWithImages[] }) {
  const points = properties.filter(hasCoordinates);
  const center: [number, number] =
    points.length > 0
      ? [
          points.reduce((sum, p) => sum + p.lat, 0) / points.length,
          points.reduce((sum, p) => sum + p.lng, 0) / points.length,
        ]
      : [-32.9468, -60.6393];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full w-full"
      key={points.length}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {points.map((property) => {
        const cover = property.property_images[0];
        return (
          <Marker key={property.id} position={[property.lat, property.lng]} icon={markerIcon}>
            <Popup className="property-popup" minWidth={220} maxWidth={220}>
              <Link href={`/propiedades/${property.slug}`} className="group block">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-piedra">
                  {cover ? (
                    <Image
                      src={cover.url}
                      alt={cover.alt || property.title}
                      fill
                      sizes="220px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : null}
                  <span className="absolute left-2 top-2 rounded-md bg-grafito px-2 py-0.5 font-utility text-[9px] font-medium uppercase tracking-[0.08em] text-blanco-roto">
                    {OPERATION_LABELS[property.operation]}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-display text-base tabular-nums text-grafito">
                    {formatPrice(property.price, property.currency as "USD" | "ARS")}
                  </p>
                  <p className="mt-0.5 truncate font-body text-[13px] text-grafito/75">{property.title}</p>
                  <p className="mt-1 flex items-center gap-1 font-body text-[11px] text-grafito/50">
                    <IconPin className="h-3 w-3 shrink-0" />
                    {property.neighborhood}
                  </p>
                  <div className="mt-2 flex items-center gap-3 border-t border-piedra pt-2 font-utility text-[10px] text-grafito/60">
                    {property.bedrooms ? (
                      <span className="flex items-center gap-1">
                        <IconBed className="h-3 w-3 text-grafito/40" />
                        {property.bedrooms}
                      </span>
                    ) : null}
                    {property.m2_total ? (
                      <span className="flex items-center gap-1">
                        <IconArea className="h-3 w-3 text-grafito/40" />
                        {property.m2_total} m²
                      </span>
                    ) : null}
                    <span className="ml-auto uppercase tracking-[0.06em] text-petroleo">
                      {PROPERTY_TYPE_LABELS[property.property_type]}
                    </span>
                  </div>
                </div>
              </Link>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
