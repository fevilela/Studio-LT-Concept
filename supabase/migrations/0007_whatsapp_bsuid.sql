-- ===========================================================================
-- WHATSAPP: nomes de usuário e business-scoped user IDs (BSUID)
-- ===========================================================================
-- Com os nomes de usuário do WhatsApp, a Meta pode deixar de mandar o telefone
-- da cliente no webhook (campos `from` / `wa_id`). O identificador que sempre
-- vem é o BSUID (`from_user_id` / `user_id`), único por empresa.
-- Ref.: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids/
--
-- Por isso: telefone vira opcional e o BSUID passa a ser guardado em clientes e
-- conversas. Toda conversa precisa de pelo menos um dos dois.

alter table clients add column if not exists wa_user_id text unique;
alter table clients alter column phone drop not null;

alter table whatsapp_conversations add column if not exists wa_user_id text unique;
alter table whatsapp_conversations alter column phone_number drop not null;
alter table whatsapp_conversations
  add constraint whatsapp_conversations_identity_check
  check (phone_number is not null or wa_user_id is not null);
