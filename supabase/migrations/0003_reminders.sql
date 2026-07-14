-- Fase 5: suporte a lembretes automáticos de agendamento.
alter table appointments add column reminder_sent_at timestamptz;
