import { query } from "@/lib/db";

export type Service = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  base_price: string;
  duration_minutes: number;
};

export type TeamMember = {
  id: string;
  full_name: string;
  job_title: string | null;
  bio: string | null;
  instagram_handle: string | null;
  photo_url: string | null;
};

export async function getServices() {
  const { rows } = await query<Service>(
    `select id, name, category, description, base_price, duration_minutes
     from services where active = true order by display_order asc`
  );
  return rows;
}

export async function getTeamMembers() {
  const { rows } = await query<TeamMember>(
    `select id, full_name, job_title, bio, instagram_handle, photo_url
     from team_members where active = true order by display_order asc`
  );
  return rows;
}

export type GalleryImage = {
  id: string;
  title: string | null;
  category: string | null;
  storage_path: string;
};

export async function getGalleryImages() {
  const { rows } = await query<GalleryImage>(
    `select id, title, category, storage_path
     from gallery_images where active = true order by display_order asc, created_at desc`
  );
  return rows;
}
