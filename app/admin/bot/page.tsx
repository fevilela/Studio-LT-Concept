import { getBotConfig, DEFAULT_SYSTEM_PROMPT } from "@/lib/admin-data/bot";
import { BotConfigForm } from "@/components/admin/bot-config-form";

export const dynamic = "force-dynamic";

export default async function BotConfigPage() {
  const config = await getBotConfig();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Bot de IA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure como a assistente virtual responde às noivas no WhatsApp.
        </p>
      </div>

      <BotConfigForm
        config={{
          ...config,
          system_prompt: config.system_prompt || DEFAULT_SYSTEM_PROMPT,
        }}
      />
    </div>
  );
}
