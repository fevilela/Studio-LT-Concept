const GRAPH_VERSION = "v21.0";

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
export async function sendWhatsAppTextMessage(to: string, body: string) {
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
        to: to.replace(/\D/g, ""),
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
