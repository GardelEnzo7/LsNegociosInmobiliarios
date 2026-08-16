import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { CustomSelect } from "@/components/site/custom-select";
import { IconSearch } from "@/components/site/icons";

type FilterBarProps = {
  neighborhoods: string[];
  defaultValues: {
    query?: string;
    operation?: string;
    propertyType?: string;
    neighborhood?: string;
  };
};

const PROPERTY_TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const OPERATION_OPTIONS = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
];

export function PropertiesFilterBar({ neighborhoods, defaultValues }: FilterBarProps) {
  const neighborhoodOptions = neighborhoods.map((zone) => ({ value: zone, label: zone }));

  return (
    <form action="/propiedades" method="get" className="space-y-3">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-grafito/40" />
        <input
          type="text"
          name="q"
          placeholder="Buscar por título o dirección..."
          defaultValue={defaultValues.query ?? ""}
          className="w-full rounded-xl border border-piedra bg-blanco-roto py-3 pl-11 pr-4 font-body text-sm text-grafito outline-none transition-colors duration-200 ease-out focus:border-petroleo"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="w-36">
          <CustomSelect
            name="tipo"
            placeholder="Tipo"
            options={PROPERTY_TYPE_OPTIONS}
            defaultValue={defaultValues.propertyType}
            variant="bar"
          />
        </div>
        <div className="w-36">
          <CustomSelect
            name="operacion"
            placeholder="Operación"
            options={OPERATION_OPTIONS}
            defaultValue={defaultValues.operation}
            variant="bar"
          />
        </div>
        <div className="w-36">
          <CustomSelect
            name="zona"
            placeholder="Zona"
            options={neighborhoodOptions}
            defaultValue={defaultValues.neighborhood}
            variant="bar"
          />
        </div>
        <button
          type="submit"
          className="ml-auto rounded-xl bg-grafito px-6 py-2.5 font-utility text-[11px] font-medium uppercase tracking-[0.08em] text-blanco-roto transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.97]"
        >
          Filtrar
        </button>
      </div>
    </form>
  );
}
