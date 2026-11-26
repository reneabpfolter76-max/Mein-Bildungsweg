import { config } from "@/lib/config";
import { getProfile } from "@/lib/data/profiles";
import { newCaseId } from "@/lib/ids";
import { PROMPT_VERSION } from "@/lib/advisor/masterprompt";
import type { Identity } from "@/lib/auth/session";
import type { Case, CaseStatus, Settings } from "@/lib/types";

/** Nach dieser Inaktivität gilt ein offener Fall als abgebrochen. */
export const ABANDON_AFTER_MINUTES = 30;

export function createCaseFor(identity: Identity, now = new Date()): Case {
  const profile = getProfile(identity.profileId);
  const at = now.toISOString();
  return {
    id: newCaseId(now),
    testerId: identity.userId,
    customerId: identity.customerId,
    startedAt: at,
    lastActivityAt: at,
    status: "offen",
    profile: { ...(profile?.profile ?? {}) },
    levelChanges: [],
    recommendations: [],
    courseNumbers: [],
    bookings: [],
    sources: [],
    model: config.openaiApiKey ? config.openaiModel : "demo-regelbasiert",
    promptVersion: PROMPT_VERSION,
    errors: [],
    tokensIn: 0,
    tokensOut: 0,
    webSearchCalls: 0,
    costEur: 0,
  };
}

/** Status für Auswertungen: offene, lange inaktive Fälle zählen als Abbruch. */
export function effectiveStatus(c: Case, now = new Date()): CaseStatus {
  if (c.status !== "offen") return c.status;
  const idleMin = (now.getTime() - new Date(c.lastActivityAt).getTime()) / 60000;
  return idleMin > ABANDON_AFTER_MINUTES ? "abgebrochen" : "offen";
}

export function durationMinutes(c: Case, now = new Date()): number {
  const end = c.endedAt ? new Date(c.endedAt) : effectiveStatus(c, now) === "offen" ? now : new Date(c.lastActivityAt);
  return Math.max(0, Math.round((end.getTime() - new Date(c.startedAt).getTime()) / 60000));
}

export function estimateCostEur(tokensIn: number, tokensOut: number, webSearchCalls: number): number {
  const p = config.prices;
  return (tokensIn / 1e6) * p.inputEurPerMTok + (tokensOut / 1e6) * p.outputEurPerMTok + webSearchCalls * p.webSearchEurPerCall;
}

export function startOfDayIso(now = new Date()): string {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthCostEur(cases: Case[], now = new Date()): number {
  const key = monthKey(now.toISOString());
  return cases.filter((c) => monthKey(c.lastActivityAt) === key).reduce((sum, c) => sum + c.costEur, 0);
}

export type LimitCheck = { ok: true } | { ok: false; reason: string };

/**
 * Fair-Use-Regeln für die kostenlose Nutzung: Limit pro Person und Tag sowie
 * Kostenobergrenze pro Monat. Schützt das Budget, wenn alle myWIFI-Registrierten zugreifen.
 */
export function checkLimits(args: {
  settings: Settings;
  messagesToday: number;
  monthCost: number;
}): LimitCheck {
  const { settings, messagesToday, monthCost } = args;
  if (settings.paused) return { ok: false, reason: "Der Bildungsnavigator ist derzeit pausiert. Bitte versuchen Sie es später erneut oder nutzen Sie die persönliche Beratung." };
  if (messagesToday >= settings.dailyMessageLimit) {
    return { ok: false, reason: `Das tägliche Limit von ${settings.dailyMessageLimit} Nachrichten ist erreicht. Morgen geht es weiter – oder Sie vereinbaren eine persönliche Beratung.` };
  }
  if (settings.monthlyBudgetEur > 0 && monthCost >= settings.monthlyBudgetEur) {
    return { ok: false, reason: "Das monatliche Nutzungskontingent ist ausgeschöpft. Bitte nutzen Sie bis Monatsende die persönliche Beratung." };
  }
  return { ok: true };
}
