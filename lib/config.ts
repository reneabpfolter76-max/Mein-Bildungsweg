/**
 * Zentrale Konfiguration aus Umgebungsvariablen.
 * Alle Werte werden nur serverseitig gelesen.
 */
function num(value: string | undefined, fallback: number): number {
  const n = value === undefined || value === "" ? NaN : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  get sessionSecret(): string {
    const s = process.env.SESSION_SECRET;
    if (!s || s.length < 16) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("SESSION_SECRET fehlt oder ist zu kurz (mind. 16 Zeichen).");
      }
      return "dev-only-secret-not-for-production-use";
    }
    return s;
  },
  get pilotAccessCode(): string {
    return process.env.PILOT_ACCESS_CODE ?? "pilot";
  },
  get adminAccessCode(): string {
    return process.env.ADMIN_ACCESS_CODE ?? "admin";
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
