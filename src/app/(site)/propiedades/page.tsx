import type { Metadata } from "next";
import { PropertiesFilterBar } from "@/components/site/properties-filter-bar";
import { PropertiesMapLoader } from "@/components/site/properties-map-loader";
import { PropertyCard } from "@/components/site/property-card";
import { Reveal } from "@/components/site/reveal";
import { getNeighborhoods, getProperties, getPriceRangesByCurrency } from "@/lib/data/properties";
import { pageOpenGraph } from "@/lib/constants";

const DESCRIPTION =
  "Explorá casas, departamentos, PH, terrenos, locales y oficinas en venta y alquiler en Rosario.";

export const metadata: Metadata = {
  title: "Propiedades en Rosario",
  description: DESCRIPTION,
  alternates: { canonical: "/propiedades" },
  openGraph: { ...pageOpenGraph("Propiedades en Rosario", DESCRIPTION), url: "/propiedades" },
};

type SearchParams = Promise<{
  operacion?: string;
  tipo?: string;
  zona?: string;
  moneda?: string;
  precioMin?: string;
  precioMax?: string;
  q?: string;
}>;

function parseOptionalPrice(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  // El precio/moneda solo se aplica como filtro real una vez que el usuario
  // efectivamente lo usó (moneda presente en la URL) — así una visita directa
  // a /propiedades sigue mostrando todo, sin un filtro de moneda implícito.
  const hasPriceFilter = params.moneda === "USD" || params.moneda === "ARS";

  const filters = {
    operation: params.operacion || undefined,
    propertyType: params.tipo || undefined,
    neighborhood: params.zona || undefined,
    query: params.q || undefined,
    currency: hasPriceFilter ? params.moneda : undefined,
    priceMin: hasPriceFilter ? parseOptionalPrice(params.precioMin) : undefined,
    priceMax: hasPriceFilter ? parseOptionalPrice(params.precioMax) : undefined,
  };

  const [neighborhoods, properties, priceRanges] = await Promise.all([
    getNeighborhoods(),
    getProperties(filters),
    getPriceRangesByCurrency(),
  ]);

  const hasActiveFilters = Boolean(
    params.operacion || params.tipo || params.zona || params.q || hasPriceFilter,
  );

  return (
    <div className="grid lg:h-[calc(100vh-5rem)] lg:grid-cols-[1fr_1.2fr]">
      <div className="h-[40vh] lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
        <PropertiesMapLoader properties={properties} />
      </div>

      <div className="overflow-y-auto px-6 py-10 sm:px-10 lg:py-12">
        <PropertiesFilterBar
          neighborhoods={neighborhoods}
          priceRanges={priceRanges}
          hasActiveFilters={hasActiveFilters}
          defaultValues={{
            query: params.q,
            operation: filters.operation,
            propertyType: filters.propertyType,
            neighborhood: filters.neighborhood,
            currency: filters.currency,
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
          }}
        />

        <p className="mt-6 font-utility text-[12px] uppercase tracking-[0.1em] text-grafito/50">
          {properties.length} {properties.length === 1 ? "resultado" : "resultados"}
        </p>

        {properties.length === 0 ? (
          <p className="mt-16 max-w-md font-body text-grafito/60">
            No encontramos propiedades con esos filtros por ahora. Probá ampliando la
            búsqueda o escribinos y te avisamos apenas surja algo así.
          </p>
        ) : (
          <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2">
            {properties.map((property, index) => (
              <Reveal key={property.id} delay={(index % 4) * 60}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
