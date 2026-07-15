-- Campo de CPF para clientes, usado em buscas e possivelmente emissão de nota fiscal futura.
alter table clients add column cpf text;
create index idx_clients_cpf on clients (cpf);
create index idx_clients_full_name on clients (lower(full_name));
