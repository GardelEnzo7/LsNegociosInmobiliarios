import type { Metadata } from "next";
import Link from "next/link";
import { CollectionsBoard } from "@/components/admin/collections-board";
import { PageHeader } from "@/components/admin/ui/page-header";
import { IconArrowLeft } from "@/components/admin/ui/icons";
import { getCollections } from "@/lib/data/admin";
import { PERIOD_PATTERN, currentPeriod, formatPeriod, shiftPeriod } from "@/lib/rental-reminders";

export const metadata: Metadata = { title: "Cobros" };

export default async function AdminCobrosPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes } = await searchParams;
  const today = currentPeriod();
  const period = mes && PERIOD_PATTERN.test(mes) ? mes : today;
  const { rows, debts } = await getCollections(period);

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Cobros"
        subtitle="El alquiler de cada contrato activo, mes a mes. Marcá lo que ya se cobró y mirá quién debe."
        action={
          <nav aria-label="Cambiar de mes" className="flex items-center gap-1 rounded-xl bg-blanco-roto p-1 ring-1 ring-grafito/[0.07]">
            <MonthLink period={shiftPeriod(period, -1)} label="Mes anterior" direction="prev" />
            <p className="min-w-36 px-2 text-center text-sm font-medium text-grafito" aria-live="polite">
              {formatPeriod(period)}
            </p>
            <MonthLink period={shiftPeriod(period, 1)} label="Mes siguiente" direction="next" />
          </nav>
        }
      />
      {period !== today ? (
        <p className="mt-3 text-sm">
          <Link href="/admin/cobros" className="text-petroleo hover:underline">
            Volver a {formatPeriod(today)}
          </Link>
        </p>
      ) : null}

      <div className="mt-8">
        <CollectionsBoard period={period} rows={rows} debts={debts} />
      </div>
    </div>
  );
}

function MonthLink({ period, label, direction }: { period: string; label: string; direction: "prev" | "next" }) {
  return (
    <Link
      href={`/admin/cobros?mes=${period}`}
      aria-label={`${label}: ${formatPeriod(period)}`}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-grafito/60 transition-colors duration-150 ease-out hover:bg-plata hover:text-grafito"
    >
      <IconArrowLeft className={direction === "next" ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
    </Link>
  );
}
