"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const contractSchema = z.object({
  propertyId: z.string().uuid("Elegí una propiedad."),
  ownerName: z.string().trim().min(2, "Ingresá el nombre del propietario."),
  ownerPhone: z.string().trim().optional(),
  ownerEmail: z.string().trim().optional(),
  tenantName: z.string().trim().min(2, "Ingresá el nombre del inquilino."),
  tenantPhone: z.string().trim().optional(),
  tenantEmail: z.string().trim().optional(),
  startDate: z.string().min(1, "Ingresá la fecha de inicio."),
  endDate: z.string().trim().optional(),
  rentAmount: z.coerce.number().min(0, "Ingresá un monto de alquiler válido."),
  rentCurrency: z.enum(["ARS", "USD"]),
  expensasAmount: z.coerce.number().optional().or(z.nan()),
  notes: z.string().trim().optional(),
});

export type ContractFormState = { error?: string };

export async function createContract(
  _prevState: ContractFormState,
  formData: FormData,
): Promise<ContractFormState> {
  const parsed = contractSchema.safeParse({
    propertyId: formData.get("propertyId"),
    ownerName: formData.get("ownerName"),
    ownerPhone: formData.get("ownerPhone") || undefined,
    ownerEmail: formData.get("ownerEmail") || undefined,
    tenantName: formData.get("tenantName"),
    tenantPhone: formData.get("tenantPhone") || undefined,
    tenantEmail: formData.get("tenantEmail") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    rentAmount: formData.get("rentAmount"),
    rentCurrency: formData.get("rentCurrency") || "ARS",
    expensasAmount: formData.get("expensasAmount") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los campos del formulario." };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { data: owner, error: ownerError } = await supabase
    .from("contacts")
    .insert({
      full_name: data.ownerName,
      contact_phone: data.ownerPhone || null,
      contact_email: data.ownerEmail || null,
      source: "administracion",
    })
    .select("id")
    .single();

  const { data: tenant, error: tenantError } = await supabase
    .from("contacts")
    .insert({
      full_name: data.tenantName,
      contact_phone: data.tenantPhone || null,
      contact_email: data.tenantEmail || null,
      source: "administracion",
    })
    .select("id")
    .single();

  if (ownerError || tenantError || !owner || !tenant) {
    return { error: "No se pudo crear la administración." };
  }

  await supabase.from("contact_roles").insert([
    { contact_id: owner.id, role: "propietario" },
    { contact_id: tenant.id, role: "inquilino" },
  ]);

  const { error: contractError } = await supabase.from("rental_contracts").insert({
    property_id: data.propertyId,
    owner_id: owner.id,
    tenant_id: tenant.id,
    start_date: data.startDate,
    end_date: data.endDate || null,
    rent_amount: data.rentAmount,
    rent_currency: data.rentCurrency,
    expensas_amount: Number.isFinite(data.expensasAmount) ? data.expensasAmount : null,
    notes: data.notes || null,
  });

  if (contractError) {
    return { error: "No se pudo crear la administración." };
  }

  revalidatePath("/admin/administraciones");
  redirect("/admin/administraciones");
}

export async function updateContractStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("rental_contracts").update({ status }).eq("id", id);
  revalidatePath("/admin/administraciones");
  revalidatePath(`/admin/administraciones/${id}`);
}

export async function deleteContract(id: string) {
  const supabase = await createClient();
  await supabase.from("rental_contracts").delete().eq("id", id);
  revalidatePath("/admin/administraciones");
  redirect("/admin/administraciones");
}

const paymentSchema = z.object({
  contractId: z.string().uuid(),
  paymentType: z.enum(["alquiler", "expensas", "luz", "gas", "agua", "otro"]),
  period: z.string().trim().min(1, "Ingresá el período (ej. 2026-08)."),
  amount: z.coerce.number().optional().or(z.nan()),
  paid: z.coerce.boolean().optional(),
  notes: z.string().trim().optional(),
});

export type PaymentFormState = { error?: string };

export async function addPayment(
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const parsed = paymentSchema.safeParse({
    contractId: formData.get("contractId"),
    paymentType: formData.get("paymentType"),
    period: formData.get("period"),
    amount: formData.get("amount") || undefined,
    paid: formData.get("paid") === "on",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los campos." };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("rental_payments").insert({
    contract_id: data.contractId,
    payment_type: data.paymentType,
    period: data.period,
    amount: Number.isFinite(data.amount) ? data.amount : null,
    paid: data.paid ?? false,
    paid_at: data.paid ? new Date().toISOString().slice(0, 10) : null,
    notes: data.notes || null,
  });

  if (error) {
    return { error: "No se pudo cargar el pago." };
  }

  revalidatePath(`/admin/administraciones/${data.contractId}`);
  return {};
}

export async function togglePaymentPaid(id: string, contractId: string, paid: boolean) {
  const supabase = await createClient();
  await supabase
    .from("rental_payments")
    .update({ paid, paid_at: paid ? new Date().toISOString().slice(0, 10) : null })
    .eq("id", id);
  revalidatePath(`/admin/administraciones/${contractId}`);
}

export async function deletePayment(id: string, contractId: string) {
  const supabase = await createClient();
  await supabase.from("rental_payments").delete().eq("id", id);
  revalidatePath(`/admin/administraciones/${contractId}`);
}
