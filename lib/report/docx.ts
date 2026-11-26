import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import { durationMinutes, effectiveStatus } from "@/lib/cases";
import { getCourse } from "@/lib/data/courses";
import type { Case, Message } from "@/lib/types";

const LEVEL_TEXT = { L1: "L1 – Kursinformation", L2: "L2 – WIFI-Fachberatung", L3: "L3 – Bildungsorientierung" } as const;
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" }) : "–");

function h(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_2) {
  return new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
}
function p(text: string, opts: { bold?: boolean; italics?: boolean; size?: number } = {}) {
  return new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 80 } });
}
function multiline(text: string) {
  return text.split(/\r?\n/).map((line) => p(line.replace(/^\s*[-*]\s+/, "• ").replace(/\*\*/g, "")));
}
function bullets(items: string[]) {
  return items.map((t) => new Paragraph({ text: t, bullet: { level: 0 } }));
}
function kv(rows: [string, string | undefined][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([k, v]) =>
        new TableRow({
          children: [
            new TableCell({ width: { size: 32, type: WidthType.PERCENTAGE }, children: [p(k, { bold: true })] }),
            new TableCell({ width: { size: 68, type: WidthType.PERCENTAGE }, children: [p(v || "–")] }),
          ],
        }),
    ),
  });
}

/** Word-Bericht zu einem Beratungsfall. */
export async function buildCaseReport(c: Case, messages: Message[]): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({ text: "WIFI Bildungsnavigator – Beratungsbericht", heading: HeadingLevel.TITLE }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: "Interner Pilot – fiktive Testdaten. KI-generierte, unverbindliche Information. Zulassungen, Anrechnungen und Förderentscheidungen trifft die zuständige Stelle.",
          italics: true,
          size: 18,
        }),
      ],
      spacing: { after: 200 },
    }),
    kv([
      ["Fall-ID", c.id],
      ["Testperson", c.testerId],
      ["Beginn", fmtDate(c.startedAt)],
      ["Ende / letzte Aktivität", fmtDate(c.endedAt ?? c.lastActivityAt)],
      ["Dauer", `${durationMinutes(c)} Minuten`],
      ["Status", effectiveStatus(c)],
      ["Einstiegslevel", c.entryLevel ? LEVEL_TEXT[c.entryLevel] : undefined],
      ["Abschlusslevel", c.finalLevel ? LEVEL_TEXT[c.finalLevel] : undefined],
      ["Thema", c.topic],
    ]),
    h("Beratungsprofil"),
    kv([
      ["Altersgruppe", c.profile.ageGroup],
      ["Vorbildung", c.profile.education],
      ["Berufserfahrung", c.profile.workExperience],
      ["Beschäftigung", c.profile.employment],
      ["Bezirk", c.profile.district],
      ["Ziel", c.profile.goal],
    ]),
  ];

  if (c.summary) children.push(h("Zusammenfassung"), ...multiline(c.summary));
  if (c.educationPlan) children.push(h("Individueller Bildungsplan"), ...multiline(c.educationPlan));
  if (c.recommendations.length) children.push(h("Empfehlungen"), ...bullets(c.recommendations));
  if (c.courseNumbers.length) {
    children.push(
      h("Kurse (fiktiver Testkatalog)"),
      ...bullets(
        c.courseNumbers.map((n) => {
          const course = getCourse(n);
          return course ? `${course.number} – ${course.title}, ${course.priceEur.toLocaleString("de-AT")} €` : n;
        }),
      ),
    );
  }
  if (c.costs || c.funding) {
    children.push(h("Kosten und mögliche Förderungen"), kv([["Kosten", c.costs], ["Förderung (zu prüfen)", c.funding]]));
  }
  if (c.bookings.length) {
    children.push(h("Simulierte Buchungen"), ...bullets(c.bookings.map((b) => `${b.courseNumber} / ${b.dateId} – Bestätigung ${b.confirmation} (SIMULIERT)`)));
  }
  if (c.handover) {
    children.push(
      h("Übergabe an persönliche Beratung"),
      kv([
        ["Zuständige Stelle", c.handover.target],
        ["Kanal", c.handover.channel],
        ["Zusammenfassung", c.handover.summary],
        ["Offene Fragen", c.handover.openQuestions?.join("; ")],
      ]),
    );
  }
  if (c.sources.length) {
    children.push(h("Quellen"), ...bullets(c.sources.map((s) => `${s.title} – ${s.url} (abgerufen ${fmtDate(s.retrievedAt)})`)));
  }
  children.push(
    h("Nachvollziehbarkeit"),
    kv([
      ["Modell", c.model],
      ["Prompt-Version", c.promptVersion],
      ["Levelwechsel", c.levelChanges.map((l) => `${l.from ?? "–"} → ${l.to}`).join(", ")],
      ["Fehler", c.errors.join("; ")],
    ]),
    h("Gesprächsverlauf"),
  );
  for (const m of messages) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: m.role === "user" ? "Kunde/Kundin: " : "Bildungsnavigator: ", bold: true })],
        spacing: { before: 120 },
      }),
      ...multiline(m.content),
    );
  }

  const doc = new Document({
    creator: "WIFI Bildungsnavigator (Pilot)",
    title: `Beratungsbericht ${c.id}`,
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{ children }],
  });
  return Packer.toBuffer(doc);
}
