"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function validateImageFile(file: FormDataEntryValue | null): asserts file is File {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecione uma imagem.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("A imagem deve ter no máximo 10MB.");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato não suportado. Use JPG, PNG, WEBP ou AVIF.");
  }
}

export async function uploadGalleryImage(formData: FormData) {
  await requireAuth();

  const file = formData.get("file");
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  validateImageFile(file);

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${randomUUID()}.${ext}`;

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from("gallery").upload(path, file, {
    contentType: file.type,
  });
  if (uploadError) {
    throw new Error("Falha ao enviar a foto: " + uploadError.message);
  }

  const { rows } = await query<{ next_order: number }>(
    `select coalesce(max(display_order), 0) + 1 as next_order from gallery_images`
  );

  await query(
    `insert into gallery_images (title, category, storage_path, display_order)
     values ($1, $2, $3, $4)`,
    [title || null, category || null, path, rows[0].next_order]
  );

  revalidatePath("/admin/galeria");
  revalidatePath("/galeria");
}

export async function deleteGalleryImage(id: string, storagePath: string) {
  await requireAuth();

  const admin = createAdminClient();
  await admin.storage.from("gallery").remove([storagePath]);
  await query(`delete from gallery_images where id = $1`, [id]);

  revalidatePath("/admin/galeria");
  revalidatePath("/galeria");
}

export async function toggleGalleryImageActive(id: string, active: boolean) {
  await requireAuth();
  await query(`update gallery_images set active = $1 where id = $2`, [active, id]);
  revalidatePath("/admin/galeria");
  revalidatePath("/galeria");
}

export async function updateGalleryImageDetails(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  if (!id) throw new Error("Foto inválida.");

  await query(
    `update gallery_images set title = nullif($1, ''), category = nullif($2, '') where id = $3`,
    [title, category, id]
  );

  revalidatePath("/admin/galeria");
  revalidatePath("/galeria");
}

const SITE_IMAGE_KEYS = ["hero", "about"] as const;
type SiteImageKey = (typeof SITE_IMAGE_KEYS)[number];

export async function uploadSiteImage(formData: FormData) {
  await requireAuth();

  const key = String(formData.get("key") ?? "");
  if (!SITE_IMAGE_KEYS.includes(key as SiteImageKey)) {
    throw new Error("Imagem inválida.");
  }

  const file = formData.get("file");
  validateImageFile(file);

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `site/${key}-${randomUUID()}.${ext}`;

  const { rows } = await query<{ storage_path: string }>(
    `select storage_path from site_images where key = $1`,
    [key]
  );
  const previousPath = rows[0]?.storage_path ?? null;

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from("gallery").upload(path, file, {
    contentType: file.type,
  });
  if (uploadError) {
    throw new Error("Falha ao enviar a imagem: " + uploadError.message);
  }

  await query(
    `insert into site_images (key, storage_path, updated_at) values ($1, $2, now())
     on conflict (key) do update set storage_path = excluded.storage_path, updated_at = now()`,
    [key, path]
  );

  if (previousPath) {
    await admin.storage.from("gallery").remove([previousPath]);
  }

  revalidatePath("/admin/galeria");
  revalidatePath("/");
}

export async function moveGalleryImage(id: string, direction: "up" | "down") {
  await requireAuth();

  const { rows } = await query<{ id: string; display_order: number }>(
    `select id, display_order from gallery_images order by display_order asc, created_at desc`
  );
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= rows.length) return;

  const current = rows[index];
  const target = rows[swapIndex];

  await query(`update gallery_images set display_order = $1 where id = $2`, [
    target.display_order,
    current.id,
  ]);
  await query(`update gallery_images set display_order = $1 where id = $2`, [
    current.display_order,
    target.id,
  ]);

  revalidatePath("/admin/galeria");
  revalidatePath("/galeria");
}
