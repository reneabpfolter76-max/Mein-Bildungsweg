import OpenAI from "openai";
import { config, isDemoMode } from "@/lib/config";
import { MASTERPROMPT, buildContext } from "@/lib/advisor/masterprompt";
import { FUNCTION_TOOLS, executeTool } from "@/lib/advisor/tools";
import { demoTurn } from "@/lib/advisor/demo";
import type { Case, Message, Source } from "@/lib/types";

export interface TurnResult {
  reply: string;
  sources: Source[];
  tokensIn: number;
  tokensOut: number;
  webSearchCalls: number;
  errors: string[];
}

const MAX_TOOL_ROUNDS = 6;

let client: OpenAI | null = null;
function openai(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: config.openaiApiKey });
  return client;
}

/**
 * Ein Beratungsschritt: Nutzernachricht → Antwort des Assistenten.
 * Der Fall `c` wird durch Werkzeugaufrufe direkt aktualisiert.
 */
export async function runTurn(c: Case, history: Message[], userText: string): Promise<TurnResult> {
  if (isDemoMode()) return demoTurn(c, userText);

  const now = new Date();
  const tools: OpenAI.Responses.Tool[] = [...FUNCTION_TOOLS];
  if (config.webSearch) {
    tools.push({ type: "web_search", user_location: { type: "approximate", country: "AT", region: "Oberösterreich" } });
  }

  // Bisheriger Gesprächsverlauf + neue Nachricht. Die Daten werden bei OpenAI nicht
  // gespeichert (store: false); Reasoning-Inhalte werden verschlüsselt zurückgegeben.
  const input: OpenAI.Responses.ResponseInput = [
    ...history.map((m) => ({ role: m.role, content: m.content }) as OpenAI.Responses.EasyInputMessage),
    { role: "user", content: userText },
  ];

  const result: TurnResult = { reply: "", sources: [], tokensIn: 0, tokensOut: 0, webSearchCalls: 0, errors: [] };

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await openai().responses.create({
      model: config.openaiModel,
      instructions: `${MASTERPROMPT}\n\n${buildContext(c, now)}`,
      input,
      tools,
      store: false,
      // Reasoning-Modelle: verschlüsselte Zwischenschritte zurückgeben, da nichts gespeichert wird.
      ...(isReasoningModel(config.openaiModel) && { include: ["reasoning.encrypted_content"] as const }),
    });

    result.tokensIn += response.usage?.input_tokens ?? 0;
    result.tokensOut += response.usage?.output_tokens ?? 0;

    const calls: OpenAI.Responses.ResponseFunctionToolCall[] = [];
    for (const item of response.output) {
      if (item.type === "function_call") calls.push(item);
      if (item.type === "web_search_call") result.webSearchCalls++;
      if (item.type === "message") {
        for (const part of item.content) {
          if (part.type !== "output_text") continue;
          for (const ann of part.annotations ?? []) {
            if (ann.type === "url_citation") {
              result.sources.push({ url: ann.url, title: ann.title, retrievedAt: now.toISOString() });
            }
          }
        }
      }
    }

    if (calls.length === 0) {
      result.reply = response.output_text.trim();
      break;
    }

    input.push(...(response.output as OpenAI.Responses.ResponseInputItem[]));
    for (const call of calls) {
      let output: unknown;
      try {
        output = executeTool(call.name, call.arguments, c, now);
      } catch (e) {
        const msg = `Werkzeugfehler ${call.name}: ${(e as Error).message}`;
        result.errors.push(msg);
        output = { fehler: msg };
      }
      input.push({ type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) });
    }
  }

  if (!result.reply) {
    result.errors.push("Keine abschließende Antwort nach maximaler Anzahl an Werkzeugrunden.");
    result.reply =
      "Entschuldigung, ich konnte Ihre Anfrage gerade nicht vollständig bearbeiten. Bitte formulieren Sie sie noch einmal oder wählen Sie eine persönliche Beratung.";
  }
  result.sources = dedupeSources(result.sources);
  return result;
}

export function isReasoningModel(model: string): boolean {
  return /^(gpt-5|o\d)/i.test(model);
}

export function dedupeSources(sources: Source[]): Source[] {
  const seen = new Set<string>();
  return sources.filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
}
