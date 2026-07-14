"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

export async function saveBotConfig(formData: FormData) {
  await requireAuth();

  const systemPrompt = String(formData.get("system_prompt") ?? "").trim();
  const escalationKeywordsRaw = String(formData.get("escalation_keywords") ?? "");
  const active = formData.get("active") === "on";

  const escalationKeywords = escalationKeywordsRaw
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  if (!systemPrompt) throw new Error("O prompt do bot não pode ficar vazio.");

  await query(
    `update bot_config
     set system_prompt = $1, escalation_keywords = $2, active = $3, updated_at = now()
     where id = 1`,
    [systemPrompt, escalationKeywords, active]
  );

  revalidatePath("/admin/bot");
}
