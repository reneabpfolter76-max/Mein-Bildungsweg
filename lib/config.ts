import { createHash } from "node:crypto";

/**
 * Zentrale Konfiguration aus Umgebungsvariablen.
 * Alle Werte werden nur serverseitig gelesen.
 */
const env = (name: string): string | undefined => {
  const v = process.env[name]?.trim();
  return v ? v : undefined;
};
function num(value: string | undefined, fallback: number): number {
  const n = value === undefined || value === "" ? NaN : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  /**
   * Schlüssel für Sitzungs-Cookies. Fehlt SESSION_SECRET, wird er aus den
   * Zugangscodes abgeleitet, damit die Anmeldung trotzdem funktioniert.
   * Für den Produktivbetrieb SESSION_SECRET immer setzen.
   */
  get sessionSecret(): string {
    const s = env("SESSION_SECRET");
    if (s && s.length >= 16) return s;
    return createHash("sha256")
      .update(`bildungsnavigator|${this.adminAccessCode}|${this.pilotAccessCode}|${process.env.VERCEL_PROJECT_ID ?? ""}`)
      .digest("hex");
  },
  get pilotAccessCode(): string {
    return env("PILOT_ACCESS_CODE") ?? "pilot";
  },
  get adminAccessCode(): string {
    return env("ADMIN_ACCESS_CODE") ?? "admin";
  },
  get openaiApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY || undefined;
  },
  get openaiModel(): string {
    return process.env.OPENAI_MODEL || "gpt-5-mini";
  },
  get webSearch(): boolean {
    return (process.env.OPENAI_WEB_SEARCH ?? "true").toLowerCase() !== "false";
  },
  get prices() {
    return {
      inputEurPerMTok: num(process.env.PRICE_INPUT_EUR_PER_MTOK, 0.25),
      outputEurPerMTok: num(process.env.PRICE_OUTPUT_EUR_PER_MTOK, 2.0),
      webSearchEurPerCall: num(process.env.PRICE_WEB_SEARCH_EUR_PER_CALL, 0.01),
    };
  },
  get supabaseUrl(): string | undefined {
    return process.env.SUPABASE_URL || undefined;
  },
  get supabaseServiceRoleKey(): string | undefined {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || undefined;
  },
  get dataDir(): string {
    return process.env.DATA_DIR || ".data";
  },
};

export const isDemoMode = () => !config.openaiApiKey;

/** Welche Einstellungen gesetzt sind – nur Namen und Ja/Nein, niemals Werte. */
export function setupStatus() {
  const secret = env("SESSION_SECRET");
  return [
    { name: "PILOT_ACCESS_CODE", set: !!env("PILOT_ACCESS_CODE"), hint: "Zugangscode für Testpersonen (sonst Standardcode)" },
    { name: "ADMIN_ACCESS_CODE", set: !!env("ADMIN_ACCESS_CODE"), hint: "Zugangscode für das Dashboard (sonst Standardcode)" },
    { name: "SESSION_SECRET", set: !!secret && secret.length >= 16, hint: "empfohlen, mind. 16 Zeichen (sonst automatisch abgeleitet)" },
    { name: "OPENAI_API_KEY", set: !!env("OPENAI_API_KEY"), hint: "für echte KI-Antworten (sonst Demo-Modus)" },
    { name: "SUPABASE_URL", set: !!env("SUPABASE_URL") && !!env("SUPABASE_SERVICE_ROLE_KEY"), hint: "für dauerhaftes Speichern (sonst vorübergehend)" },
  ];
}
