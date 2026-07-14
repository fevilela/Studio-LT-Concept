import { query } from "@/lib/db";

export type TeamMemberAdmin = {
  id: string;
  full_name: string;
  role: "admin" | "staff";
  job_title: string | null;
  bio: string | null;
  instagram_handle: string | null;
  display_order: number;
  active: boolean;
};

export async function getAllTeamMembers() {
  const { rows } = await query<TeamMemberAdmin>(
    `select id, full_name, role, job_title, bio, instagram_handle, display_order, active
     from team_members order by display_order asc, full_name asc`
  );
  return rows;
}
