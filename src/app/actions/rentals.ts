"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireStaff } from "@/lib/supabase/guards";

/** zod's `.optional().or(z.nan())` fields come through as `number | undefined`,
 * with "not provided" arriving as NaN — this collapses both to `null` for
 * the RPC calls below, which expect `number | null`, never `undefined`. */
function finiteOrNull(value: number | undefined): number | null {
  return Number.isFinite(value) ? (value as number) : null;
}

const isoDateSchema = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, "Ingresá una fecha válida.");

const optionalEmailSchema = z.string().trim().email("Ingresá un email válido.").max(200).optional();
const adjustmentFrequencySchema = z.coerce
  .number()
  .int()
  .refine((value) => [1, 3, 4, 6, 12].includes(value), "Elegí una periodicidad válida.")
  .optional()
  .or(z.nan());

const contractSchema = z.object({
  propertyId: z.string().uuid("Elegí una propiedad."),
  ownerName: z.string().trim().min(2, "Ingresá el nombre del propietario.").max(200),
  ownerPhone: z.string().trim().max(100).optional(),
  ownerEmail: optionalEmailSchema,
  tenantName: z.string().trim().min(2, "Ingresá el nombre del inquilino.").max(200),
  tenantPhone: z.string().trim().max(100).optional(),
  tenantEmail: optionalEmailSchema,
  startDate: isoDateSchema,
  endDate: isoDateSchema.optional(),
  rentAmount: z.coerce.number().min(0, "Ingresá un monto de alquiler válido."),
  rentCurrency: z.enum(["ARS", "USD"]),
  expensasAmount: z.coerce.number().min(0).optional().or(z.nan()),
  notes: z.string().trim().max(2000).optional(),
  adjustmentType: z.enum(["ipc", "icl", "otro", ""]).optional(),
  adjustmentFrequencyMonths: adjustmentFrequencySchema,
}).superRefine((data, context) => {
  if (data.endDate && data.endDate < data.startDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "La fecha de fin no puede ser anterior al inicio." });
  }
  const hasType = Boolean(data.adjustmentType);
  const hasFrequency = Number.isFinite(data.adjustmentFrequencyMonths);
  if (hasType !== hasFrequency) {
    context.addIssue({
      code: "custom",
      path: ["adjustmentType"],
      message: "Definí tanto el tipo como la periodicidad del ajuste, o dejá ambos vacíos.",
    });
  }
});

export type ContractFormState = { error?: string };

export async function createContract(
  _prevState: ContractFormState,
  formData: FormData,
): Promise<ContractFormState> {
  try {
    await requireStaff();
  } catch {
    return { error: "No tenés permiso para crear administraciones." };
  }

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
    adjustmentType: formData.get("adjustmentType") || "",
    adjustmentFrequencyMonths: formData.get("adjustmentFrequencyMonths") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los campos del formulario." };
  }

  const data = parsed.data;
  const supabase = await createClient();

  // Atomic: owner contact + role, tenant contact + role, and the contract
  // itself all happen inside one Postgres transaction (migration 0029). A
  // failure on the contract insert used to leave two orphaned contacts
  // behind (created independently, before this existed) — now the whole
  // call rolls back together. `adjustment_next_date` is no longer sent
  // from here at all (migration 0030 removed that parameter): the RPC
  // computes it internally from start_date + frequency via
  // add_months_clamped, so the database — not a client — is the only
  // source of truth for that date.
  const { error } = await supabase.rpc("create_rental_administration", {
    p_property_id: data.propertyId,
    p_owner_name: data.ownerName,
    p_owner_phone: data.ownerPhone || null,
    p_owner_email: data.ownerEmail || null,
    p_tenant_name: data.tenantName,
    p_tenant_phone: data.tenantPhone || null,
    p_tenant_email: data.tenantEmail || null,
    p_start_date: data.startDate,
    p_end_date: data.endDate || null,
    p_rent_amount: data.rentAmount,
    p_rent_currency: data.rentCurrency,
    p_expensas_amount: finiteOrNull(data.expensasAmount),
    p_notes: data.notes || null,
    p_adjustment_type: data.adjustmentType || null,
    p_adjustment_frequency_months: finiteOrNull(data.adjustmentFrequencyMonths),
  });

  if (error) {
    return { error: "No se pudo crear la administración." };
  }

  revalidatePath("/admin/administraciones");
  redirect("/admin/administraciones");
}

export async function updateContractStatus(id: string, status: string) {
  await requireStaff();
  const parsed = z.enum(["activo", "finalizado"]).safeParse(status);
  if (!parsed.success) throw new Error("Estado de contrato inválido.");
  const supabase = await createClient();
  const { error } = await supabase.from("rental_contracts").update({ status: parsed.data }).eq("id", id);
  if (error) throw new Error("No se pudo actualizar el estado del contrato.");
  revalidatePath("/admin/administraciones");
  revalidatePath(`/admin/administraciones/${id}`);
}

export async function deleteContract(id: string) {
  // Matches the "admins can delete rental_contracts" RLS policy — checked
  // here too so a rejected delete never silently redirects as if it worked.
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("rental_contracts").delete().eq("id", id);
  revalidatePath("/admin/administraciones");
  if (error) return;
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
  try {
    await requireStaff();
  } catch {
    return { error: "No tenés permiso para cargar pagos." };
  }

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
  await requireStaff();
  const supabase = await createClient();
  await supabase
    .from("rental_payments")
    .update({ paid, paid_at: paid ? new Date().toISOString().slice(0, 10) : null })
    .eq("id", id);
  revalidatePath(`/admin/administraciones/${contractId}`);
}

export async function deletePayment(id: string, contractId: string) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("rental_payments").delete().eq("id", id);
  revalidatePath(`/admin/administraciones/${contractId}`);
}

const adjustmentSettingsSchema = z.object({
  contractId: z.string().uuid(),
  adjustmentType: z.enum(["ipc", "icl", "otro", ""]).optional(),
  adjustmentFrequencyMonths: adjustmentFrequencySchema,
}).superRefine((data, context) => {
  const hasType = Boolean(data.adjustmentType);
  const hasFrequency = Number.isFinite(data.adjustmentFrequencyMonths);
  if (hasType !== hasFrequency) {
    context.addIssue({
      code: "custom",
      message: "Definí tanto el tipo como la periodicidad, o dejá ambos vacíos.",
    });
  }
});

export type AdjustmentSettingsFormState = { error?: string };

/** Updates the adjustment schedule (type + periodicity) and recomputes
 * `adjustment_next_date` from the most recent adjustment's date (or the
 * contract's start date if none has been registered yet) + the new
 * frequency — the "fecha base" for the next cycle. */
export async function updateAdjustmentSettings(
  _prevState: AdjustmentSettingsFormState,
  formData: FormData,
): Promise<AdjustmentSettingsFormState> {
  try {
    await requireStaff();
  } catch {
    return { error: "No tenés permiso para editar esto." };
  }

  const parsed = adjustmentSettingsSchema.safeParse({
    contractId: formData.get("contractId"),
    adjustmentType: formData.get("adjustmentType") || "",
    adjustmentFrequencyMonths: formData.get("adjustmentFrequencyMonths") || undefined,
  });
  if (!parsed.success) {
    return { error: "Revisá los campos." };
  }

  const supabase = await createClient();

  // Atomic: locks the same rental_contracts row apply_rental_adjustment
  // locks (migration 0030), so the two can never race each other on this
  // contract — whichever commits first wins, the other sees its committed
  // state before computing anything. Replaces the old
  // read-last-adjustment -> compute-in-TS -> update-without-a-lock flow,
  // which Codex flagged as a race with apply_rental_adjustment that could
  // overwrite adjustment_next_date with stale info. The RPC computes the
  // date internally via add_months_clamped — this action no longer does.
  const { error } = await supabase.rpc("update_rental_adjustment_settings", {
    p_contract_id: parsed.data.contractId,
    p_adjustment_type: parsed.data.adjustmentType || null,
    p_adjustment_frequency_months: finiteOrNull(parsed.data.adjustmentFrequencyMonths),
  });

  if (error) {
    if (error.message.includes("Contract not found")) {
      return { error: "No se encontró el contrato." };
    }
    return { error: "No se pudo guardar la configuración de ajuste." };
  }

  revalidatePath(`/admin/administraciones/${parsed.data.contractId}`);
  return {};
}

const adjustmentSchema = z.object({
  contractId: z.string().uuid(),
  effectiveDate: isoDateSchema,
  percentage: z.coerce.number().optional().or(z.nan()),
  newAmount: z.coerce.number().positive("Ingresá un nuevo valor de alquiler mayor a cero."),
  notes: z.string().trim().max(2000).optional(),
});

export type AdjustmentFormState = { error?: string };

/** Registers one applied adjustment (previous value, %, new value) and
 * rolls it forward: the contract's `rent_amount` becomes the new value —
 * the single source of truth for "valor actual" — and `adjustment_next_date`
 * advances from this adjustment's date by the configured periodicity. */
export async function registerAdjustment(
  _prevState: AdjustmentFormState,
  formData: FormData,
): Promise<AdjustmentFormState> {
  try {
    await requireStaff();
  } catch {
    return { error: "No tenés permiso para registrar ajustes." };
  }

  const parsed = adjustmentSchema.safeParse({
    contractId: formData.get("contractId"),
    effectiveDate: formData.get("effectiveDate"),
    percentage: formData.get("percentage") || undefined,
    newAmount: formData.get("newAmount"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los campos." };
  }

  const data = parsed.data;
  const supabase = await createClient();

  // Atomic: locks the contract row, validates the date, inserts the
  // history row (with the contract's current adjustment_type carried onto
  // it), updates rent_amount + adjustment_next_date, and logs activity_log
  // — all inside one Postgres transaction (migration 0029). No manual
  // rollback needed here anymore: a failure at any step aborts the whole
  // RPC call, so rental_adjustments and rental_contracts.rent_amount can
  // never drift out of sync the way the old insert-then-update flow could.
  const { error } = await supabase.rpc("apply_rental_adjustment", {
    p_contract_id: data.contractId,
    p_effective_date: data.effectiveDate,
    p_percentage: finiteOrNull(data.percentage),
    p_new_amount: data.newAmount,
    p_notes: data.notes || null,
  });

  if (error) {
    if (error.message.includes("Contract not found")) {
      return { error: "No se encontró el contrato." };
    }
    if (error.message.includes("Effective date must be after")) {
      return { error: "La fecha del ajuste debe ser posterior al último ajuste (o al inicio del contrato)." };
    }
    return { error: "No se pudo aplicar el ajuste." };
  }

  revalidatePath(`/admin/administraciones/${data.contractId}`);
  revalidatePath("/admin/administraciones");
  return {};
}
