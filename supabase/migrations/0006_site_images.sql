-- Imagens únicas de seções fixas do site (hero da home, "Quem Somos"), gerenciadas
-- pelo painel admin. Uma linha por "slot" (key), sobrescrita a cada novo upload.
create table site_images (
  key text primary key,
  storage_path text not null,
  updated_at timestamptz not null default now()
);

alter table site_images enable row level security;

create policy "public read site_images" on site_images
  for select to anon using (true);
