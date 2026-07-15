-- Fase 6: contas de clientes (noivas) — login obrigatório para orçamento + portal com histórico.

alter table clients add column auth_user_id uuid references auth.users (id) unique;

-- Necessário para o proxy (rodando em runtime sem acesso a `pg` direto) conseguir
-- checar, via cliente Supabase com RLS, se o usuário autenticado é da equipe.
create policy "authenticated can read own team_member row" on team_members
  for select to authenticated using (auth_user_id = auth.uid());
