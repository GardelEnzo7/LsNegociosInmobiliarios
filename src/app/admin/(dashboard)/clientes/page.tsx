import { LeadForm } from "@/components/admin/lead-form";
import { LeadsList } from "@/components/admin/leads-list";
import { getAllLeads, getPropertiesForSelect } from "@/lib/data/admin";

export default async function AdminClientsPage() {
  const [leads, properties] = await Promise.all([getAllLeads(), getPropertiesForSelect()]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Clientes</h1>
          <p className="mt-1 text-sm text-zinc-500">{leads.length} en total.</p>
        </div>
      </div>

      <div className="mt-6 max-w-3xl space-y-6">
        <LeadForm properties={properties} />
        <LeadsList leads={leads} />
      </div>
    </div>
  );
}
