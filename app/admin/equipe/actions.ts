"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

export async function saveTeamMember(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "staff");
  const job_title = String(formData.get("job_title") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const instagram_handle = String(formData.get("instagram_handle") ?? "")
    .trim()
    .replace(/^@/, "");

  if (!full_name) throw new Error("Nome é obrigatório.");
  if (role !== "admin" && role !== "staff") throw new Error("Papel inválido.");

  if (id) {
    await query(
      `update team_members
       set full_name = $1, role = $2, job_title = nullif($3, ''), bio = nullif($4, ''),
           instagram_handle = nullif($5, '')
       where id = $6`,
      [full_name, role, job_title, bio, instagram_handle, id]
    );
  } else {
    await query(
      `insert into team_members (full_name, role, job_title, bio, instagram_handle)
       values ($1, $2, nullif($3, ''), nullif($4, ''), nullif($5, ''))`,
      [full_name, role, job_title, bio, instagram_handle]
    );
  }

  revalidatePath("/admin/equipe");
  revalidatePath("/equipe");
}

export async function toggleTeamMemberActive(id: string, active: boolean) {
  await requireAuth();
  await query(`update team_members set active = $1 where id = $2`, [active, id]);
  revalidatePath("/admin/equipe");
  revalidatePath("/equipe");
}
