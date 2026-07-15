import type { User } from "@supabase/supabase-js";
import { query } from "@/lib/db";

export type ClientProfile = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
};

/**
 * Garante que exista uma linha em `clients` vinculada a este usuário autenticado,
 * criando-a a partir do nome/telefone informados no cadastro (guardados em
 * user_metadata) na primeira vez que ela é necessária. Isso cobre tanto o caso
 * de confirmação de e-mail imediata quanto o de confirmação por link posterior.
 * Se já existir um cliente com o mesmo telefone (ex.: criado via WhatsApp antes
 * da conta existir), a conta é vinculada a esse registro em vez de duplicar.
 */
export async function ensureClientProfile(user: User): Promise<ClientProfile | null> {
  const { rows: existing } = await query<ClientProfile>(
    `select id, full_name, phone, email from clients where auth_user_id = $1`,
    [user.id]
  );
  if (existing.length > 0) return existing[0];

  const fullName = (user.user_metadata?.full_name as string | undefined)?.trim();
  const phone = (user.user_metadata?.phone as string | undefined)?.trim();
  if (!fullName || !phone) return null;

  const { rows } = await query<ClientProfile>(
    `insert into clients (auth_user_id, full_name, phone, email)
     values ($1, $2, $3, $4)
     on conflict (phone) do update
       set auth_user_id = excluded.auth_user_id,
           full_name = excluded.full_name
     returning id, full_name, phone, email`,
    [user.id, fullName, phone, user.email ?? null]
  );
  return rows[0];
}
