"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { normalizeBrazilPhone } from "@/lib/phone";

export async function updateClient(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const cpf = String(formData.get("cpf") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id) throw new Error("Cliente inválido.");
  if (!fullName) throw new Error("Nome é obrigatório.");
  if (!phoneRaw) throw new Error("Telefone é obrigatório.");

  const phone = normalizeBrazilPhone(phoneRaw);

  await query(
    `update clients
     set full_name = $1, phone = $2, email = nullif($3, ''), cpf = nullif($4, ''), notes = nullif($5, '')
     where id = $6`,
    [fullName, phone, email, cpf, notes, id]
  );

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
}
