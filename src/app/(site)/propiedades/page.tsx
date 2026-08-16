import { PropertiesFilterBar } from "@/components/site/properties-filter-bar";
import { PropertiesMapLoader } from "@/components/site/properties-map-loader";
import { PropertyCard } from "@/components/site/property-card";
import { Reveal } from "@/components/site/reveal";
import { getNeighborhoods, getProperties } from "@/lib/data/properties";

type SearchParams = Promise<{
  operacion?: string;
  tipo?: string;
  zona?: string;
  precioMax?: string;
  q?: string;
}>;

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = {
    operation: params.operacion || undefined,
    propertyType: params.tipo || undefined,
    neighborhood: params.zona || undefined,
    priceMax: params.precioMax ? Number(params.precioMax) : undefined,
    query: params.q || undefined,
  };

  const [neighborhoods, properties] = await Promise.all([
    getNeighborhoods(),
    getProperties(filters),
  ]);

  return (
    <div className="grid lg:h-[calc(100vh-5rem)] lg:grid-cols-[1fr_1.2fr]">
      <div className="h-[40vh] lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
        <PropertiesMapLoader properties={properties} />
      </div>

      <div className="overflow-y-auto px-6 py-10 sm:px-10 lg:py-12">
        <PropertiesFilterBar
          neighborhoods={neighborhoods}
          defaultValues={{
            query: params.q,
            operation: filters.operation,
            propertyType: filters.propertyType,
            neighborhood: filters.neighborhood,
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
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
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
