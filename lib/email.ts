const RESEND_API_URL = "https://api.resend.com/emails";
const SITE_URL = "https://studio-lt-concept.onrender.com";

function getConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey || !to) return null;
  return { apiKey, to, from };
}

export async function sendNewQuoteNotificationEmail(params: {
  quoteId: string;
  fullName: string;
  phone: string;
  eventDate: string;
  serviceNames: string[];
  total: number;
}) {
  const config = getConfig();
  if (!config) {
    console.warn(
      "[email] RESEND_API_KEY ou ADMIN_NOTIFICATION_EMAIL não configurados — pulando notificação por e-mail."
    );
    return;
  }

  const formattedDate = new Date(params.eventDate).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
  const formattedTotal = params.total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Studio LT Concept <${config.from}>`,
      to: [config.to],
      subject: `Novo orçamento: ${params.fullName} — ${formattedDate}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; color: #292524;">
          <h2 style="margin-bottom: 4px;">Novo pedido de orçamento</h2>
          <p style="color: #78716c; margin-top: 0;">Recebido pelo site.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 4px 0; color: #78716c;">Cliente</td><td style="padding: 4px 0;">${params.fullName}</td></tr>
            <tr><td style="padding: 4px 0; color: #78716c;">Telefone</td><td style="padding: 4px 0;">${params.phone}</td></tr>
            <tr><td style="padding: 4px 0; color: #78716c;">Data do evento</td><td style="padding: 4px 0;">${formattedDate}</td></tr>
            <tr><td style="padding: 4px 0; color: #78716c;">Serviços</td><td style="padding: 4px 0;">${params.serviceNames.join(", ")}</td></tr>
            <tr><td style="padding: 4px 0; color: #78716c;">Valor total</td><td style="padding: 4px 0;">${formattedTotal}</td></tr>
          </table>
          <a href="${SITE_URL}/admin/orcamentos/${params.quoteId}"
             style="display: inline-block; padding: 10px 20px; background: #b45309; color: #fff; border-radius: 8px; text-decoration: none;">
            Ver orçamento no painel
          </a>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    console.error("[email] Falha ao enviar notificação de novo orçamento:", json ?? res.statusText);
  }
}
