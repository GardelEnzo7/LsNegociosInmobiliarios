import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { CustomSelect } from "@/components/site/custom-select";
import { IconSearch } from "@/components/site/icons";
import { cn } from "@/lib/utils";

const fieldClass = "w-full bg-transparent font-body text-sm text-grafito outline-none";

const PROPERTY_TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const OPERATION_OPTIONS = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
];

type PropertySearchProps = {
  neighborhoods: string[];
  defaultValues?: {
    operation?: string;
    propertyType?: string;
    neighborhood?: string;
    priceMax?: string;
  };
};

export function PropertySearch({ neighborhoods, defaultValues }: PropertySearchProps) {
  const neighborhoodOptions = neighborhoods.map((zone) => ({ value: zone, label: zone }));

  return (
    <form
      action="/propiedades"
      method="get"
      className="mx-auto flex w-full max-w-6xl flex-col rounded-2xl bg-blanco-roto shadow-[0_24px_60px_-16px_rgba(28,33,41,0.45)] sm:flex-row sm:items-stretch"
    >
      <FieldWrap className="rounded-t-2xl sm:rounded-l-2xl sm:rounded-t-none">
        <CustomSelect
          name="tipo"
          label="Tipo de propiedad"
          placeholder="Todos los tipos"
          options={PROPERTY_TYPE_OPTIONS}
          defaultValue={defaultValues?.propertyType}
        />
      </FieldWrap>
      <Divider />
      <FieldWrap>
        <CustomSelect
          name="operacion"
          label="Operación"
          placeholder="Cualquiera"
          options={OPERATION_OPTIONS}
          defaultValue={defaultValues?.operation}
        />
      </FieldWrap>
      <Divider />
      <FieldWrap>
        <CustomSelect
          name="zona"
          label="Zona"
          placeholder="Todas"
          options={neighborhoodOptions}
          defaultValue={defaultValues?.neighborhood}
        />
      </FieldWrap>
      <Divider />
      <label className="flex flex-1 cursor-pointer flex-col gap-1 px-5 py-4 transition-colors duration-200 ease-out hover:bg-plata/60">
        <span className="whitespace-nowrap font-utility text-[10px] uppercase tracking-[0.14em] text-grafito/45">
          Precio máximo
        </span>
        <input
          type="number"
          name="precioMax"
          min={0}
          placeholder="Sin límite"
          defaultValue={defaultValues?.priceMax ?? ""}
          className={cn(fieldClass, "placeholder:text-grafito/35")}
        />
      </label>
      <button
        type="submit"
        className="group flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-b-2xl bg-grafito px-7 py-4 font-utility text-[13px] font-medium uppercase tracking-[0.08em] text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98] sm:rounded-b-none sm:rounded-r-2xl"
      >
        <IconSearch className="h-4 w-4 shrink-0" />
        Buscar Propiedades
      </button>
    </form>
  );
}

function Divider() {
  return <div className="hidden w-px shrink-0 bg-piedra sm:block" aria-hidden="true" />;
}

function FieldWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex-1 px-5 py-4 transition-colors duration-200 ease-out hover:bg-plata/60",
        className,
      )}
    >
      {children}
    </div>
  );
}
