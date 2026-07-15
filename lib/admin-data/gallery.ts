import { query } from "@/lib/db";

export type GalleryImageAdmin = {
  id: string;
  title: string | null;
  category: string | null;
  storage_path: string;
  display_order: number;
  active: boolean;
  created_at: string;
};

export async function getAllGalleryImages() {
  const { rows } = await query<GalleryImageAdmin>(
    `select id, title, category, storage_path, display_order, active, created_at
     from gallery_images order by display_order asc, created_at desc`
  );
  return rows;
}
