import { executeTool } from "@/lib/advisor/tools";
import type { TurnResult } from "@/lib/advisor/advisor";
import type { Case, Level } from "@/lib/types";

/**
 * Demo-Modus ohne KI (kein OPENAI_API_KEY gesetzt).
 * Regelbasierte Triage, damit Oberfläche, Fallspeicherung, Bericht und Export
 * ohne API-Konto getestet werden können. Ersetzt NICHT die KI-Beratung.
 */
const L3_WORDS = ["neuorientierung", "neu orientieren", "studium", "studieren", "fh", "universität", "uni ", "anerkennung", "ausland", "umschulung", "karriere", "was passt", "beruf wechseln", "berufswechsel", "anderer beruf"];
const L2_WORDS = ["lap", "lehrabschluss", "meister", "werkmeister", "zulassung", "anrechnung", "voraussetzung", "förderung", "fördern", "befähigung", "unternehmerprüfung", "eignung", "nachholen"];
const L1_WORDS = ["kurs", "termin", "preis", "kostet", "kosten", "wann", "anmelden", "buchen", "freie plätze", "seminar"];
const HANDOVER_WORDS = ["persönlich", "berater", "beraterin", "anrufen", "rückruf", "termin für beratung", "mensch"];

export function classifyDemo(text: string): Level | null {
  const t = ` ${text.toLowerCase()} `;
  if (L3_WORDS.some((w) => t.includes(w))) return "L3";
  if (L2_WORDS.some((w) => t.includes(w))) return "L2";
  if (L1_WORDS.some((w) => t.includes(w))) return "L1";
  return null;
}

export function demoTurn(c: Case, userText: string): TurnResult {
  const now = new Date();
  const text = userText.trim();
  const lower = text.toLowerCase();
  const lines: string[] = [];
  const prefix = "_(Demo-Modus ohne KI – regelbasierte Antwort)_";

  // Simulierte Buchung: "buchen FX-1001-A"
  const booking = text.match(/\b(FX-\d{4})-([A-Z])\b/i);
  if (booking && lower.includes("buch")) {
    const out = executeTool(
      "termin_simuliert_buchen",
      JSON.stringify({ kursnummer: booking[1], termin_id: `${booking[1]}-${booking[2]}` }),
      c,
      now,
    ) as Record<string, unknown>;
    if (!c.finalLevel) executeTool("fall_aktualisieren", JSON.stringify({ level: "L1", level_begruendung: "Buchungswunsch" }), c, now);
    lines.push(
      out.fehler
        ? `Die Buchung war nicht möglich: ${String(out.fehler)}`
        : `Ihre **simulierte** Buchung ist erfasst (Bestätigung ${String(out.bestaetigung)}): ${String(out.kurs)}, ${String(out.termin)}. Im Pilot wird nichts tatsächlich gebucht.`,
    );
    return result(prefix, lines);
  }

  if (HANDOVER_WORDS.some((w) => lower.includes(w))) {
    executeTool(
      "uebergabe_anfordern",
      JSON.stringify({
        zielstelle: c.finalLevel === "L3" ? "WIFI-Bildungsberatung" : "WIFI-Fachbereich",
        kanal: "telefon",
        zusammenfassung: `Wunsch nach persönlicher Beratung. Thema: ${c.topic ?? text.slice(0, 120)}`,
      }),
      c,
      now,
    );
    lines.push("Gerne vermittle ich Sie an eine persönliche Beratung. Die Übergabe ist (simuliert) angefordert – die zuständige Stelle würde sich telefonisch bei Ihnen melden.");
    return result(prefix, lines);
  }

  const level = classifyDemo(text) ?? c.finalLevel ?? null;
  if (level) {
    executeTool(
      "fall_aktualisieren",
      JSON.stringify({ level, level_begruendung: "Regelbasierte Stichworterkennung (Demo)", thema: c.topic ?? text.slice(0, 80) }),
      c,
      now,
    );
  }

  if (!level) {
    lines.push(
      "Guten Tag! Ich bin der WIFI Bildungsnavigator, ein KI-Assistent (hier im Demo-Modus). Meine Auskünfte sind unverbindlich.",
      "Worum geht es Ihnen? Zum Beispiel: ein bestimmter Kurs, ein Abschluss wie LAP oder Werkmeister, oder eine berufliche Neuorientierung?",
    );
    return result(prefix, lines);
  }

  const search = executeTool("kurse_suchen", JSON.stringify({ suchbegriff: text }), c, now) as {
    treffer: { kursnummer: string; titel: string; preis_eur: number; termine: { termin_id: string; beginn: string; ort: string; freie_plaetze: number }[] }[];
  };
  const hits = search.treffer.slice(0, 3);

  if (level === "L1") {
    if (hits.length === 0) {
      lines.push("Dazu habe ich im (fiktiven) Testkatalog keinen passenden Kurs gefunden. Können Sie das Thema genauer beschreiben?");
    } else {
      lines.push("Diese Kurse passen (fiktiver Testkatalog):");
      for (const h of hits) {
        const d = h.termine[0];
        lines.push(`- **${h.kursnummer}** ${h.titel} – ${h.preis_eur.toLocaleString("de-AT")} €${d ? `, nächster Termin ${d.beginn} in ${d.ort} (Termin-ID ${d.termin_id}, ${d.freie_plaetze} Plätze frei)` : ""}`);
      }
      lines.push("Zum simulierten Buchen schreiben Sie z. B. „buchen " + (hits[0].termine[0]?.termin_id ?? "FX-1001-A") + "“.");
      executeTool("fall_aktualisieren", JSON.stringify({ kursnummern: hits.map((h) => h.kursnummer) }), c, now);
    }
  } else if (level === "L2") {
    lines.push(
      "Das ist ein Thema für die WIFI-Fachberatung (Level 2). Damit ich Ihre Anfrage gut vorbereiten kann:",
      "1. Welche Ausbildung bzw. welchen Abschluss haben Sie bereits?",
      "2. Wie viele Jahre Berufserfahrung haben Sie in diesem Bereich?",
      "Zulassungen, Anrechnungen und Förderungen entscheidet die zuständige Stelle – ich kann Sie aber vorbereiten und weiterleiten.",
    );
    if (hits.length) lines.push(`Möglicherweise passend: ${hits.map((h) => `${h.kursnummer} ${h.titel}`).join("; ")}.`);
  } else {
    lines.push(
      "Bei einer beruflichen Neuorientierung schauen wir bewusst über das WIFI-Angebot hinaus (Level 3).",
      "Was machen Sie derzeit gerne, und was soll sich an Ihrer Arbeit ändern? Gibt es einen zeitlichen oder finanziellen Rahmen?",
      "Im Demo-Modus ist keine Internetrecherche aktiv; mit KI-Schlüssel recherchiere ich aktuelle Quellen.",
    );
  }
  return result(prefix, lines);
}

function result(prefix: string, lines: string[]): TurnResult {
  return {
    reply: `${prefix}\n\n${lines.join("\n")}`,
    sources: [],
    tokensIn: 0,
    tokensOut: 0,
    webSearchCalls: 0,
    errors: [],
  };
}
