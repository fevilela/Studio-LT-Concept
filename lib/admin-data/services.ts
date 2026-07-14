import { query } from "@/lib/db";

export type ServiceAdmin = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  base_price: string;
  duration_minutes: number;
  display_order: number;
  active: boolean;
};

export async function getAllServices() {
  const { rows } = await query<ServiceAdmin>(
    `select id, name, category, description, base_price, duration_minutes, display_order, active
     from services order by display_order asc, name asc`
  );
  return rows;
}
