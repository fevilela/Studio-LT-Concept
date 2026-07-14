"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

const VALID_CATEGORIES = ["maquiagem", "penteado", "cerimonia", "pacote"];

export async function saveService(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const basePrice = Number(formData.get("base_price"));
  const durationMinutes = Number(formData.get("duration_minutes")) || 60;

  if (!name) throw new Error("Nome é obrigatório.");
  if (!VALID_CATEGORIES.includes(category)) throw new Error("Categoria inválida.");
  if (!Number.isFinite(basePrice) || basePrice < 0) throw new Error("Preço inválido.");

  if (id) {
    await query(
      `update services
       set name = $1, category = $2, description = nullif($3, ''), base_price = $4, duration_minutes = $5
       where id = $6`,
      [name, category, description, basePrice, durationMinutes, id]
    );
  } else {
    await query(
      `insert into services (name, category, description, base_price, duration_minutes)
       values ($1, $2, nullif($3, ''), $4, $5)`,
      [name, category, description, basePrice, durationMinutes]
    );
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/servicos");
  revalidatePath("/orcamento");
  revalidatePath("/");
}

export async function toggleServiceActive(id: string, active: boolean) {
  await requireAuth();
  await query(`update services set active = $1 where id = $2`, [active, id]);
  revalidatePath("/admin/configuracoes");
  revalidatePath("/servicos");
  revalidatePath("/orcamento");
  revalidatePath("/");
}
