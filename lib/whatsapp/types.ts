// Formato dos webhooks da WhatsApp Business Cloud API (Meta).
// Referência: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks

export type WhatsAppInboundMessage = {
  /** Telefone da cliente. Pode NÃO vir se ela usa nome de usuário no WhatsApp. */
  from?: string;
  /** Business-scoped user ID (BSUID) — sempre presente nas versões novas. */
  from_user_id?: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  audio?: { id: string; mime_type: string };
  document?: { id: string; mime_type: string; filename?: string };
  [key: string]: unknown;
};

export type WhatsAppStatusUpdate = {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id?: string;
  recipient_user_id?: string;
  errors?: Array<{
    code: number;
    title?: string;
    message?: string;
    error_data?: { details?: string };
  }>;
};

export type WhatsAppWebhookPayload = {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: {
        messaging_product: "whatsapp";
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{
          profile?: { name?: string; username?: string };
          /** Telefone — pode não vir para quem usa nome de usuário. */
          wa_id?: string;
          /** BSUID */
          user_id?: string;
        }>;
        messages?: WhatsAppInboundMessage[];
        statuses?: WhatsAppStatusUpdate[];
      };
    }>;
  }>;
};
