// v21.0 expira em 21/01/2027. Ver https://developers.facebook.com/docs/graph-api/changelog/versions
const GRAPH_VERSION = "v26.0";

/**
 * Destinatário de uma mensagem. Com os nomes de usuário do WhatsApp, a Meta pode
 * não informar o telefone da cliente — nesse caso envia-se para o BSUID
 * (campo `recipient`). Se houver telefone, ele é usado (`to`).
 */
export type WhatsAppRecipient = { phone?: string | null; userId?: string | null };

function recipientFields(recipient: WhatsAppRecipient) {
  const phone = recipient.phone?.replace(/\D/g, "");
  if (phone) return { to: phone };
  if (recipient.userId) return { recipient: recipient.userId };
  throw new Error("Essa conversa não tem telefone nem ID do WhatsApp para enviar a mensagem.");
}

function getConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error(
      "WhatsApp Cloud API não configurada (faltam WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID no .env.local)."
    );
  }

  return { accessToken, phoneNumberId };
}

/** Envia uma mensagem de texto livre. Só funciona dentro da janela de 24h desde a última mensagem do cliente. */
export async function sendWhatsAppTextMessage(to: WhatsAppRecipient, body: string) {
  const { accessToken, phoneNumberId } = getConfig();

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        ...recipientFields(to),
        type: "text",
        text: { body },
      }),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    const message = json?.error?.message ?? "Falha ao enviar mensagem no WhatsApp.";
    throw new Error(message);
  }

  return json.messages?.[0]?.id as string | undefined;
}

/**
 * Envia uma mensagem de template pré-aprovado pela Meta — necessário para iniciar
 * contato fora da janela de 24h (ex.: lembretes de agendamento). O nome do template
 * e seus parâmetros dependem do que for cadastrado e aprovado no Business Manager.
 *
 * `parameters` usa nomes de variável (ex.: `{ nome_cliente: "Maria" }`), não posição
 * — é a convenção atual do Business Manager para templates novos (variáveis tipo
 * `{{nome_cliente}}` em vez de `{{1}}`).
 */
export async function sendWhatsAppTemplateMessage(
  to: WhatsAppRecipient,
  templateName: string,
  languageCode: string,
  parameters: Record<string, string> = {}
) {
  const { accessToken, phoneNumberId } = getConfig();

  const parameterEntries = Object.entries(parameters);

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        ...recipientFields(to),
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: parameterEntries.length
            ? [
                {
                  type: "body",
                  parameters: parameterEntries.map(([parameter_name, text]) => ({
                    type: "text",
                    parameter_name,
                    text,
                  })),
                },
              ]
            : undefined,
        },
      }),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    const message = json?.error?.message ?? "Falha ao enviar template no WhatsApp.";
    throw new Error(message);
  }

  return json.messages?.[0]?.id as string | undefined;
}

/**
 * Envia o template de primeiro contato (WHATSAPP_QUOTE_CONTACT_TEMPLATE_NAME) — usado
 * quando a cliente ainda nunca mandou mensagem nenhuma, ao clicar em "Iniciar conversa"
 * num orçamento.
 */
export async function sendFirstContactTemplateMessage(to: WhatsAppRecipient, clientFirstName: string) {
  const templateName = process.env.WHATSAPP_QUOTE_CONTACT_TEMPLATE_NAME;
  if (!templateName) {
    throw new Error(
      "Nenhum modelo de mensagem configurado ainda (WHATSAPP_QUOTE_CONTACT_TEMPLATE_NAME)."
    );
  }

  const messageId = await sendWhatsAppTemplateMessage(to, templateName, "pt_BR", {
    nome_cliente: clientFirstName,
  });

  const content = `[Modelo enviado] Olá ${clientFirstName}! Recebemos seu pedido de orçamento no site e ficaríamos muito felizes em conversar com você sobre os detalhes do seu grande dia. Pode responder essa mensagem quando puder! 💛`;

  return { messageId, content };
}

/**
 * Envia o template de reengajamento (WHATSAPP_REACTIVATION_TEMPLATE_NAME) — usado pelo
 * botão "Reenviar mensagem de contato" quando a janela de 24h já expirou numa conversa
 * que já tinha mensagens antes. Template simples, sem variáveis (ex.: "Olá!").
 */
export async function sendReopenConversationMessage(to: WhatsAppRecipient) {
  const templateName = process.env.WHATSAPP_REACTIVATION_TEMPLATE_NAME;
  if (!templateName) {
    throw new Error(
      "Nenhum modelo de reengajamento configurado ainda (WHATSAPP_REACTIVATION_TEMPLATE_NAME)."
    );
  }

  const messageId = await sendWhatsAppTemplateMessage(to, templateName, "pt_BR");

  return { messageId, content: "[Modelo enviado] Olá!" };
}
