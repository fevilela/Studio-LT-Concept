import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { rows } = await query<{ total: string }>(
    `select coalesce(sum(unread_count), 0) as total from whatsapp_conversations`
  );

  return NextResponse.json({ total: Number(rows[0].total) });
}
