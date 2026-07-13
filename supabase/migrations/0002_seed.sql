-- Seed inicial com conteúdo real do site atual (thainaltnoivas.com.br)
-- Preços são placeholders — a Thainá deve ajustá-los no painel admin (Fase 2).

insert into services (name, category, description, base_price, duration_minutes, display_order) values
  ('Maquiagem de Noiva', 'maquiagem', 'Profissionais que conhecem sua beleza, produtos de alta qualidade, dedicando atenção à sua face e preferências para um resultado impecável e duradouro.', 350.00, 90, 1),
  ('Penteado de Noiva', 'penteado', 'Um penteado à medida das suas expectativas e estética, realçando sua beleza e individualidade única.', 300.00, 90, 2),
  ('Produção Completa de Noiva', 'pacote', 'Maquiagem + penteado com equipe qualificada, cuidando de cada detalhe do seu grande dia.', 600.00, 180, 3);

insert into team_members (full_name, role, job_title, bio, instagram_handle, display_order) values
  ('Thainá Souza', 'admin', 'Penteadista & Maquiadora', 'Penteadista e Maquiadora especialista em noivas. Mais de 10 anos no mercado realizando beleza e realizando sonhos.', 'thainasouza.studiolt', 1),
  ('Tamara Oliveira', 'staff', 'Maquiadora', 'Especialista em maquiagem Beauty. Há mais de 4 anos realizando sonhos através da maquiagem!', 'tamaraoliveiramake', 2),
  ('Ariston Oliveira', 'staff', 'Maquiador & Penteadista', 'Há mais de 10 anos realçando sua beleza. Especialista em pele negra e em todos os tipos de produções.', 'ariston_studio', 3),
  ('Jardel Gonçalves', 'staff', 'Cabeleireiro & Penteadista', 'Transformando desejos em realidade, elevando autoestima e renovando pessoas.', 'jardelgoncalves__', 4),
  ('Nathaly Lima', 'staff', 'Maquiadora & Penteadista', 'Especialista em make beauty, há 9 anos presente nos momentos mais importantes da vida de mulheres.', 'nathyrenault', 5);
