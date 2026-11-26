import { z } from "zod";
import { getCourse, searchCourses, type Course } from "@/lib/data/courses";
import type { Case, Level } from "@/lib/types";

/** Werkzeugdefinitionen im Format der OpenAI Responses API. */
export const FUNCTION_TOOLS = [
  {
    type: "function" as const,
    name: "kurse_suchen",
    description:
      "Sucht im (fiktiven) WIFI-Kurskatalog nach Kursen inkl. Terminen, Preisen und freien Plätzen. Einzige erlaubte Quelle für Kursdaten.",
    strict: false,
    parameters: {
      type: "object",
      properties: {
        suchbegriff: { type: "string", description: "Stichworte, z. B. 'Werkmeister Maschinenbau' oder 'Excel'" },
        kategorie: { type: "string", description: "optional, z. B. 'Technik', 'Sprachen'" },
        ort: { type: "string", description: "optional, z. B. 'Linz', 'Wels', 'Online'" },
      },
      required: ["suchbegriff"],
      additionalProperties: false,
    },
  },
  {
    type: "function" as const,
    name: "termin_simuliert_buchen",
    description:
      "Simuliert eine Kursbuchung (KEINE echte Buchung). Nur aufrufen, wenn die Person ausdrücklich buchen möchte.",
    strict: false,
    parameters: {
      type: "object",
      properties: {
        kursnummer: { type: "string" },
        termin_id: { type: "string" },
      },
      required: ["kursnummer", "termin_id"],
      additionalProperties: false,
    },
  },
  {
    type: "function" as const,
    name: "fall_aktualisieren",
    description:
      "Dokumentiert den Beratungsfall strukturiert. Nur Felder angeben, die neu sind oder sich geändert haben.",
    strict: false,
    parameters: {
      type: "object",
      properties: {
        level: { type: "string", enum: ["L1", "L2", "L3"] },
        level_begruendung: { type: "string" },
        thema: { type: "string", description: "Kurzes Thema, z. B. 'Werkmeister Maschinenbau'" },
        beratungsprofil: {
          type: "object",
          properties: {
            altersgruppe: { type: "string" },
            vorbildung: { type: "string" },
            berufserfahrung: { type: "string" },
            beschaeftigung: { type: "string" },
            bezirk: { type: "string" },
            ziel: { type: "string" },
          },
          additionalProperties: false,
        },
        empfehlungen: { type: "array", items: { type: "string" } },
        kursnummern: { type: "array", items: { type: "string" } },
        kosten: { type: "string" },
        foerderung: { type: "string" },
        bildungsplan: { type: "string", description: "Individueller Bildungsplan in Schritten" },
        zusammenfassung: { type: "string", description: "Kurze Zusammenfassung für Fachberatung" },
        nicht_abgedeckter_bedarf: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function" as const,
    name: "uebergabe_anfordern",
    description:
      "Fordert eine Übergabe an eine persönliche Beratung an (im Pilot simuliert). Bei L2-Fachfragen an den Fachbereich, bei L3 an die Bildungsberatung.",
    strict: false,
    parameters: {
      type: "object",
      properties: {
        zielstelle: { type: "string", description: "z. B. 'WIFI-Fachbereich Technik' oder 'WIFI-Bildungsberatung'" },
        kanal: { type: "string", enum: ["telefon", "video", "vor_ort", "offen"] },
        zusammenfassung: { type: "string" },
        offene_fragen: { type: "array", items: { type: "string" } },
      },
      required: ["zielstelle", "zusammenfassung"],
      additionalProperties: false,
    },
  },
];

const searchArgs = z.object({
  suchbegriff: z.string().default(""),
  kategorie: z.string().optional(),
  ort: z.string().optional(),
});
const bookArgs = z.object({ kursnummer: z.string(), termin_id: z.string() });
const levelEnum = z.enum(["L1", "L2", "L3"]);
const updateArgs = z.object({
  level: levelEnum.optional(),
  level_begruendung: z.string().optional(),
  thema: z.string().optional(),
  beratungsprofil: z
    .object({
      altersgruppe: z.string().optional(),
      vorbildung: z.string().optional(),
      berufserfahrung: z.string().optional(),
      beschaeftigung: z.string().optional(),
      bezirk: z.string().optional(),
      ziel: z.string().optional(),
    })
    .optional(),
  empfehlungen: z.array(z.string()).optional(),
  kursnummern: z.array(z.string()).optional(),
  kosten: z.string().optional(),
  foerderung: z.string().optional(),
  bildungsplan: z.string().optional(),
  zusammenfassung: z.string().optional(),
  nicht_abgedeckter_bedarf: z.string().optional(),
});
const handoverArgs = z.object({
  zielstelle: z.string(),
  kanal: z.enum(["telefon", "video", "vor_ort", "offen"]).default("offen"),
  zusammenfassung: z.string(),
  offene_fragen: z.array(z.string()).optional(),
});

function courseView(c: Course) {
  return {
    kursnummer: c.number,
    titel: c.title,
    kategorie: c.category,
    beschreibung: c.description,
    voraussetzungen: c.prerequisites,
    dauer_stunden: c.durationHours,
    preis_eur: c.priceEur,
    foerderhinweis: c.fundingHint ?? null,
    termine: c.dates.map((d) => ({
      termin_id: d.id,
      beginn: d.start,
      ende: d.end,
      ort: d.location,
      format: d.format,
      zeiten: d.schedule,
      freie_plaetze: d.freeSeats,
    })),
  };
}

const uniq = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))];

/** Setzt das Level und protokolliert Einstiegslevel und Levelwechsel. */
export function applyLevel(c: Case, level: Level, at: string, reason?: string): void {
  if (!c.entryLevel) c.entryLevel = level;
  if (c.finalLevel !== level) {
    c.levelChanges.push({ from: c.finalLevel ?? null, to: level, at, reason });
    c.finalLevel = level;
  }
  if (reason) c.levelReason = reason;
}

/**
 * Führt ein Werkzeug aus und aktualisiert den Fall direkt (`c` wird verändert).
 * Gibt die Antwort an das Modell zurück.
 */
export function executeTool(name: string, rawArgs: string, c: Case, now = new Date()): unknown {
  const at = now.toISOString();
  let args: unknown;
  try {
    args = rawArgs ? JSON.parse(rawArgs) : {};
  } catch {
    return { fehler: "Argumente sind kein gültiges JSON." };
  }

  switch (name) {
    case "kurse_suchen": {
      const p = searchArgs.safeParse(args);
      if (!p.success) return { fehler: "Ungültige Argumente", details: p.error.issues };
      const results = searchCourses({ query: p.data.suchbegriff, category: p.data.kategorie, location: p.data.ort });
      return {
        hinweis: "Fiktiver Testkatalog des internen Pilots.",
        treffer: results.map(courseView),
      };
    }
    case "termin_simuliert_buchen": {
      const p = bookArgs.safeParse(args);
      if (!p.success) return { fehler: "Ungültige Argumente", details: p.error.issues };
      const course = getCourse(p.data.kursnummer);
      const date = course?.dates.find((d) => d.id.toUpperCase() === p.data.termin_id.toUpperCase());
      if (!course || !date) return { fehler: "Kurs oder Termin nicht gefunden." };
      if (date.freeSeats <= 0) return { fehler: "Termin ist ausgebucht." };
      const confirmation = `SIM-${c.id.slice(-5)}-${c.bookings.length + 1}`;
      c.bookings.push({ courseNumber: course.number, dateId: date.id, confirmation, at });
      c.courseNumbers = uniq([...c.courseNumbers, course.number]);
      return {
        status: "simuliert gebucht",
        bestaetigung: confirmation,
        hinweis: "Dies ist eine SIMULIERTE Buchung im Pilot. Es wurde nichts tatsächlich gebucht.",
        kurs: course.title,
        termin: `${date.start} bis ${date.end}, ${date.location}`,
        preis_eur: course.priceEur,
      };
    }
    case "fall_aktualisieren": {
      const p = updateArgs.safeParse(args);
      if (!p.success) return { fehler: "Ungültige Argumente", details: p.error.issues };
      const a = p.data;
      if (a.level) applyLevel(c, a.level, at, a.level_begruendung);
      else if (a.level_begruendung) c.levelReason = a.level_begruendung;
      if (a.thema) c.topic = a.thema;
      if (a.beratungsprofil) {
        const b = a.beratungsprofil;
        c.profile = {
          ...c.profile,
          ...(b.altersgruppe && { ageGroup: b.altersgruppe }),
          ...(b.vorbildung && { education: b.vorbildung }),
          ...(b.berufserfahrung && { workExperience: b.berufserfahrung }),
          ...(b.beschaeftigung && { employment: b.beschaeftigung }),
          ...(b.bezirk && { district: b.bezirk }),
          ...(b.ziel && { goal: b.ziel }),
        };
      }
      if (a.empfehlungen) c.recommendations = uniq([...c.recommendations, ...a.empfehlungen]);
      if (a.kursnummern) c.courseNumbers = uniq([...c.courseNumbers, ...a.kursnummern]);
      if (a.kosten) c.costs = a.kosten;
      if (a.foerderung) c.funding = a.foerderung;
      if (a.bildungsplan) c.educationPlan = a.bildungsplan;
      if (a.zusammenfassung) c.summary = a.zusammenfassung;
      if (a.nicht_abgedeckter_bedarf) c.uncoveredNeed = a.nicht_abgedeckter_bedarf;
      return { status: "gespeichert", level: c.finalLevel ?? null };
    }
    case "uebergabe_anfordern": {
      const p = handoverArgs.safeParse(args);
      if (!p.success) return { fehler: "Ungültige Argumente", details: p.error.issues };
      c.handover = {
        target: p.data.zielstelle,
        channel: p.data.kanal,
        summary: p.data.zusammenfassung,
        openQuestions: p.data.offene_fragen,
        at,
      };
      if (!c.summary) c.summary = p.data.zusammenfassung;
      return {
        status: "Übergabe simuliert angefordert",
        hinweis:
          "Im Pilot wird keine echte Nachricht verschickt. Sagen Sie der Person, dass sich die zuständige Stelle melden würde.",
      };
    }
    default:
      return { fehler: `Unbekanntes Werkzeug: ${name}` };
  }
}
