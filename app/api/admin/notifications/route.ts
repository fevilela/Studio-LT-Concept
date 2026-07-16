import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { rows: msgRows } = await query<{ total: string }>(
    `select coalesce(sum(unread_count), 0) as total from whatsapp_conversations`
  );
  const { rows: quoteRows } = await query<{ total: string }>(
    `select count(*) as total from quotes`
  );

  return NextResponse.json({
    unreadMessages: Number(msgRows[0].total),
    quotesCount: Number(quoteRows[0].total),
  });
}
