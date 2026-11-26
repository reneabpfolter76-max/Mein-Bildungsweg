import { NextResponse } from "next/server";
import { runTurn } from "@/lib/advisor/advisor";
import { jsonError, loadOwnCase, requireIdentity } from "@/lib/auth/guard";
import { checkLimits, createCaseFor, estimateCostEur, monthCostEur, startOfDayIso } from "@/lib/cases";
import { newId } from "@/lib/ids";
import { getStore } from "@/lib/store";
import type { Case, Message } from "@/lib/types";

export const maxDuration = 120;

const MAX_LEN = 4000;

/** Neue Nachricht in einem Fall (oder neuer Fall, wenn keine caseId angegeben ist). */
export async function POST(req: Request) {
  const identity = await requireIdentity();
  if (identity instanceof NextResponse) return identity;

  const body = (await req.json().catch(() => ({}))) as { caseId?: string; message?: string };
  const text = String(body.message ?? "").trim();
  if (!text) return jsonError(400, "Bitte eine Nachricht eingeben.");
  if (text.length > MAX_LEN) return jsonError(400, `Nachricht ist zu lang (max. ${MAX_LEN} Zeichen).`);

  const store = getStore();
  const now = new Date();

  const [settings, messagesToday, allCases] = await Promise.all([
    store.getSettings(),
    store.countUserMessagesSince(identity.userId, startOfDayIso(now)),
    store.listCases(),
  ]);
  const limit = checkLimits({ settings, messagesToday, monthCost: monthCostEur(allCases, now) });
  if (!limit.ok) return jsonError(429, limit.reason);

  let c: Case;
  if (body.caseId) {
    const loaded = await loadOwnCase(identity, body.caseId);
    if (loaded instanceof NextResponse) return loaded;
    c = loaded;
    if (c.status !== "offen") return jsonError(409, "Dieser Fall ist bereits beendet. Bitte starten Sie einen neuen Fall.");
  } else {
    c = createCaseFor(identity, now);
    await store.createCase(c);
  }

  const history = await store.listMessages(c.id);
  const userMsg: Message = { id: newId(), caseId: c.id, testerId: c.testerId, role: "user", content: text, createdAt: now.toISOString() };
  await store.addMessage(userMsg);

  let reply: string;
  let sources: Message["sources"] = [];
  try {
    const r = await runTurn(c, history, text);
    reply = r.reply;
    sources = r.sources;
    c.tokensIn += r.tokensIn;
    c.tokensOut += r.tokensOut;
    c.webSearchCalls += r.webSearchCalls;
    c.costEur = estimateCostEur(c.tokensIn, c.tokensOut, c.webSearchCalls);
    c.errors.push(...r.errors);
    if (r.sources.length) {
      const known = new Set(c.sources.map((s) => s.url));
      c.sources.push(...r.sources.filter((s) => !known.has(s.url)));
      c.researchDate = now.toISOString().slice(0, 10);
    }
  } catch (e) {
    const msg = (e as Error).message || "Unbekannter Fehler";
    console.error("KI-Fehler", c.id, msg);
    c.errors.push(`KI-Fehler: ${msg}`);
    reply =
      "Entschuldigung, beim Bearbeiten ist ein technischer Fehler aufgetreten. Bitte versuchen Sie es erneut oder wählen Sie eine persönliche Beratung.";
  }

  const assistantMsg: Message = {
    id: newId(),
    caseId: c.id,
    testerId: c.testerId,
    role: "assistant",
    content: reply,
    createdAt: new Date().toISOString(),
    sources,
  };
  await store.addMessage(assistantMsg);
  c.lastActivityAt = assistantMsg.createdAt;
  await store.saveCase(c);

  return NextResponse.json({ case: c, messages: [userMsg, assistantMsg] });
}
