// Formato dos webhooks da WhatsApp Business Cloud API (Meta).
// Referência: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks

export type WhatsAppInboundMessage = {
  from: string;
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
  recipient_id: string;
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
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: WhatsAppInboundMessage[];
        statuses?: WhatsAppStatusUpdate[];
      };
    }>;
  }>;
};
