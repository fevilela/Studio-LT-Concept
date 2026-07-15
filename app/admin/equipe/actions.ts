"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { galleryImageUrl } from "@/lib/format";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const GALLERY_URL_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/`;

async function uploadTeamPhoto(file: File) {
  if (file.size > MAX_FILE_SIZE) throw new Error("A foto deve ter no máximo 10MB.");
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato não suportado. Use JPG, PNG, WEBP ou AVIF.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `team/${randomUUID()}.${ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage.from("gallery").upload(path, file, {
    contentType: file.type,
  });
  if (error) throw new Error("Falha ao enviar a foto: " + error.message);

  return galleryImageUrl(path);
}

async function deletePreviousPhoto(photoUrl: string | null) {
  if (!photoUrl || !photoUrl.startsWith(GALLERY_URL_PREFIX)) return;
  const path = photoUrl.slice(GALLERY_URL_PREFIX.length);
  const admin = createAdminClient();
  await admin.storage.from("gallery").remove([path]);
}

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
  const photoFile = formData.get("photo");

  if (!full_name) throw new Error("Nome é obrigatório.");
  if (role !== "admin" && role !== "staff") throw new Error("Papel inválido.");

  let photoUrl: string | null = null;
  if (photoFile instanceof File && photoFile.size > 0) {
    photoUrl = await uploadTeamPhoto(photoFile);
  }

  if (id) {
    if (photoUrl) {
      const { rows } = await query<{ photo_url: string | null }>(
        `select photo_url from team_members where id = $1`,
        [id]
      );
      await deletePreviousPhoto(rows[0]?.photo_url ?? null);
    }
    await query(
      `update team_members
       set full_name = $1, role = $2, job_title = nullif($3, ''), bio = nullif($4, ''),
           instagram_handle = nullif($5, ''), photo_url = coalesce($6, photo_url)
       where id = $7`,
      [full_name, role, job_title, bio, instagram_handle, photoUrl, id]
    );
  } else {
    await query(
      `insert into team_members (full_name, role, job_title, bio, instagram_handle, photo_url)
       values ($1, $2, nullif($3, ''), nullif($4, ''), nullif($5, ''), $6)`,
      [full_name, role, job_title, bio, instagram_handle, photoUrl]
    );
  }

  revalidatePath("/admin/equipe");
  revalidatePath("/equipe");
  revalidatePath("/");
}

export async function toggleTeamMemberActive(id: string, active: boolean) {
  await requireAuth();
  await query(`update team_members set active = $1 where id = $2`, [active, id]);
  revalidatePath("/admin/equipe");
  revalidatePath("/equipe");
}
