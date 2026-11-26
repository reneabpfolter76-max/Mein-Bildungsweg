import ExcelJS from "exceljs";
import { durationMinutes, effectiveStatus } from "@/lib/cases";
import { computeStats } from "@/lib/stats";
import { RATING_LABELS, type Case, type Ratings } from "@/lib/types";

/**
 * Zeile für den statistischen Export. Enthält bewusst KEINE Klarnamen,
 * E-Mail-Adressen, Kunden-IDs oder Gesprächsinhalte (Projektgrundlage Kap. 5).
 */
export function exportRow(c: Case, now = new Date()): Record<string, string | number> {
  const row: Record<string, string | number> = {
    "Fall-ID": c.id,
    "Testpersonen-ID": c.testerId,
    Beginn: c.startedAt,
    Ende: c.endedAt ?? c.lastActivityAt,
    "Dauer (Min.)": durationMinutes(c, now),
    Status: effectiveStatus(c, now),
    Altersgruppe: c.profile.ageGroup ?? "",
    Vorbildung: c.profile.education ?? "",
    Berufserfahrung: c.profile.workExperience ?? "",
    Beschäftigung: c.profile.employment ?? "",
    Bezirk: c.profile.district ?? "",
    Ziel: c.profile.goal ?? "",
    Einstiegslevel: c.entryLevel ?? "",
    Abschlusslevel: c.finalLevel ?? "",
    Levelwechsel: Math.max(0, c.levelChanges.length - 1),
    Thema: c.topic ?? "",
    Empfehlungen: c.recommendations.join("; "),
    Kursnummern: c.courseNumbers.join(", "),
    Kosten: c.costs ?? "",
    Förderung: c.funding ?? "",
    "Buchung (simuliert)": c.bookings.map((b) => b.dateId).join(", "),
    Weiterleitung: c.handover ? `${c.handover.target} (${c.handover.channel})` : "",
    Quellen: c.sources.map((s) => s.url).join(" "),
    Recherchedatum: c.researchDate ?? "",
    Modell: c.model,
    "Prompt-Version": c.promptVersion,
    Fehler: c.errors.join("; "),
  };
  for (const [k, label] of Object.entries(RATING_LABELS)) {
    row[`Bewertung: ${label}`] = c.ratings ? c.ratings[k as keyof Ratings] : "";
  }
  row["Kundenfreigabe"] = c.customerRelease ?? "";
  row["Fehlerbeschreibung"] = c.errorDescription ?? "";
  row["Feedback"] = c.feedback ?? "";
  row["Nicht abgedeckter Bedarf"] = c.uncoveredNeed ?? "";
  row["Kosten KI (EUR, geschätzt)"] = Math.round(c.costEur * 10000) / 10000;
  return row;
}

export async function buildExport(cases: Case[], now = new Date()): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "WIFI Bildungsnavigator (Pilot)";
  wb.created = now;

  const ws = wb.addWorksheet("Fälle");
  const rows = cases.map((c) => exportRow(c, now));
  const headers = rows[0] ? Object.keys(rows[0]) : Object.keys(exportRow(emptyCase(), now));
  ws.columns = headers.map((h) => ({ header: h, key: h, width: Math.min(40, Math.max(12, h.length + 2)) }));
  ws.addRows(rows);
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };

  const s = computeStats(cases, now);
  const k = wb.addWorksheet("Kennzahlen");
  k.columns = [
    { header: "Kennzahl", key: "k", width: 40 },
    { header: "Wert", key: "v", width: 30 },
  ];
  k.addRows([
    { k: "Exportzeitpunkt", v: now.toISOString() },
    { k: "Beratungsvolumen (Fälle)", v: s.total },
    { k: "Testpersonen", v: s.testers },
    { k: "Fälle L1", v: s.byLevel.L1 },
    { k: "Fälle L2", v: s.byLevel.L2 },
    { k: "Fälle L3", v: s.byLevel.L3 },
    { k: "Fälle ohne Level", v: s.byLevel.ohne },
    { k: "Abschlussquote (%)", v: s.completionRate },
    { k: "Abbruchquote (%)", v: s.abandonRate },
    { k: "Weiterleitungsquote (%)", v: s.handoverRate },
    { k: "Fälle mit Levelwechsel", v: s.levelChangeCases },
    { k: "Ø Dauer (Min.)", v: s.avgDurationMin },
    { k: "Simulierte Buchungen", v: s.simulatedBookings },
    { k: "Tatsächliche Buchungen", v: 0 },
    { k: "Ø Gesamtbewertung (1–5)", v: s.avgOverallRating ?? "" },
    ...Object.entries(s.avgRatings).map(([key, v]) => ({ k: `Ø ${RATING_LABELS[key as keyof Ratings]}`, v })),
    { k: "Kosten KI laufender Monat (EUR, geschätzt)", v: Math.round(s.monthCostEur * 100) / 100 },
  ]);
  k.getRow(1).font = { bold: true };

  return Buffer.from(await wb.xlsx.writeBuffer());
}

function emptyCase(): Case {
  const at = new Date(0).toISOString();
  return {
    id: "",
    testerId: "",
    customerId: "",
    startedAt: at,
    lastActivityAt: at,
    status: "offen",
    profile: {},
    levelChanges: [],
    recommendations: [],
    courseNumbers: [],
    bookings: [],
    sources: [],
    model: "",
    promptVersion: "",
    errors: [],
    tokensIn: 0,
    tokensOut: 0,
    webSearchCalls: 0,
    costEur: 0,
  };
}
