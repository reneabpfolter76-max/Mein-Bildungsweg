/**
 * Fiktiver Kurskatalog für den internen Pilot.
 * ALLE Kursnummern, Termine und Preise sind erfunden und dienen nur dem Test.
 * Im Produktivbetrieb wird dieser Katalog durch die WIFI-Kurs- und Terminschnittstelle ersetzt.
 */
export interface CourseDate {
  id: string;
  start: string;
  end: string;
  location: string;
  format: "Präsenz" | "Online" | "Blended";
  schedule: string;
  freeSeats: number;
}

export interface Course {
  number: string;
  title: string;
  category: string;
  keywords: string[];
  description: string;
  prerequisites: string;
  durationHours: number;
  priceEur: number;
  fundingHint?: string;
  dates: CourseDate[];
}

export const COURSES: Course[] = [
  {
    number: "FX-1001",
    title: "Werkmeisterschule Maschinenbau (fiktiv)",
    category: "Technik",
    keywords: ["werkmeister", "maschinenbau", "metall", "technik", "führung", "meister"],
    description: "Berufsbegleitende Ausbildung zur Werkmeisterin/zum Werkmeister mit Schwerpunkt Maschinenbau.",
    prerequisites: "Lehrabschluss in einschlägigem Beruf oder gleichwertige Praxis (Prüfung im Einzelfall durch den Fachbereich).",
    durationHours: 1200,
    priceEur: 5900,
    fundingHint: "Mögliche Förderungen (z. B. Bildungskonto des Landes) prüfen – Entscheidung durch Förderstelle.",
    dates: [
      { id: "FX-1001-A", start: "2027-02-15", end: "2029-01-30", location: "Linz", format: "Präsenz", schedule: "Mo/Mi 17:30–21:30, Sa 8:00–13:00", freeSeats: 6 },
      { id: "FX-1001-B", start: "2027-09-13", end: "2029-07-01", location: "Wels", format: "Blended", schedule: "Di/Do 17:30–21:30", freeSeats: 12 },
    ],
  },
  {
    number: "FX-1002",
    title: "Vorbereitung außerordentliche Lehrabschlussprüfung Elektrotechnik (fiktiv)",
    category: "Technik",
    keywords: ["lap", "lehrabschluss", "elektro", "elektrotechnik", "außerordentlich", "nachholen"],
    description: "Vorbereitungskurs auf die außerordentliche LAP im Lehrberuf Elektrotechnik.",
    prerequisites: "Zulassung zur außerordentlichen LAP durch die Lehrlingsstelle (nicht durch den Assistenten).",
    durationHours: 320,
    priceEur: 2450,
    fundingHint: "Förderungen für Lehrabschluss nachholen möglich – Entscheidung durch zuständige Förderstelle.",
    dates: [
      { id: "FX-1002-A", start: "2027-01-18", end: "2027-06-25", location: "Linz", format: "Präsenz", schedule: "Mo/Mi/Fr 17:00–21:00", freeSeats: 3 },
      { id: "FX-1002-B", start: "2027-03-01", end: "2027-08-20", location: "Steyr", format: "Präsenz", schedule: "Di/Do 17:00–21:00, Sa 8:00–12:00", freeSeats: 9 },
    ],
  },
  {
    number: "FX-1003",
    title: "CNC-Fräsen Grundlagen (fiktiv)",
    category: "Technik",
    keywords: ["cnc", "fräsen", "metall", "zerspanung", "maschine"],
    description: "Programmieren und Bedienen von CNC-Fräsmaschinen.",
    prerequisites: "Technisches Grundverständnis.",
    durationHours: 64,
    priceEur: 1290,
    dates: [
      { id: "FX-1003-A", start: "2027-01-11", end: "2027-02-19", location: "Linz", format: "Präsenz", schedule: "Mo/Mi 17:30–21:30", freeSeats: 4 },
    ],
  },
  {
    number: "FX-2001",
    title: "Office-Wiedereinstieg kompakt (fiktiv)",
    category: "Büro & Verwaltung",
    keywords: ["office", "büro", "wiedereinstieg", "excel", "word", "outlook", "verwaltung", "teilzeit"],
    description: "Aktuelles Office-Wissen für den beruflichen Wiedereinstieg: Word, Excel, Outlook, Teams.",
    prerequisites: "Keine.",
    durationHours: 48,
    priceEur: 690,
    fundingHint: "Bei Wiedereinstieg ggf. Förderung durch AMS oder Land – Entscheidung durch Förderstelle.",
    dates: [
      { id: "FX-2001-A", start: "2027-01-12", end: "2027-02-16", location: "Wels", format: "Präsenz", schedule: "Di/Do 8:30–12:30", freeSeats: 8 },
      { id: "FX-2001-B", start: "2027-02-01", end: "2027-03-08", location: "Online", format: "Online", schedule: "Mo/Mi 9:00–12:00", freeSeats: 15 },
    ],
  },
  {
    number: "FX-2002",
    title: "Buchhaltung Grundlagen (fiktiv)",
    category: "Büro & Verwaltung",
    keywords: ["buchhaltung", "rechnungswesen", "bilanz", "büro", "kaufmännisch"],
    description: "Grundlagen der doppelten Buchhaltung, Vorbereitung auf die Buchhaltungsprüfung.",
    prerequisites: "Keine.",
    durationHours: 72,
    priceEur: 980,
    dates: [
      { id: "FX-2002-A", start: "2027-02-08", end: "2027-04-12", location: "Linz", format: "Blended", schedule: "Mo 18:00–21:30", freeSeats: 11 },
    ],
  },
  {
    number: "FX-2003",
    title: "Personalverrechnung Lehrgang (fiktiv)",
    category: "Büro & Verwaltung",
    keywords: ["personalverrechnung", "lohn", "gehalt", "hr", "personal"],
    description: "Lohn- und Gehaltsverrechnung nach österreichischem Recht.",
    prerequisites: "Grundkenntnisse Buchhaltung empfohlen.",
    durationHours: 120,
    priceEur: 1650,
    dates: [
      { id: "FX-2003-A", start: "2027-03-02", end: "2027-06-15", location: "Linz", format: "Präsenz", schedule: "Di/Do 18:00–21:30", freeSeats: 5 },
    ],
  },
  {
    number: "FX-3001",
    title: "Führungskräfte-Lehrgang Basis (fiktiv)",
    category: "Management & Führung",
    keywords: ["führung", "führungskraft", "leadership", "team", "teamleitung", "management"],
    description: "Rolle, Kommunikation, Mitarbeitergespräche und Konfliktmanagement für neue und erfahrene Führungskräfte.",
    prerequisites: "Führungsverantwortung oder geplante Übernahme.",
    durationHours: 96,
    priceEur: 2890,
    dates: [
      { id: "FX-3001-A", start: "2027-02-04", end: "2027-05-20", location: "Linz", format: "Präsenz", schedule: "Do/Fr ganztägig, 6 Module", freeSeats: 7 },
      { id: "FX-3001-B", start: "2027-04-08", end: "2027-07-01", location: "Online", format: "Online", schedule: "Do 13:00–17:00", freeSeats: 14 },
    ],
  },
  {
    number: "FX-3002",
    title: "Projektmanagement Basis (fiktiv)",
    category: "Management & Führung",
    keywords: ["projektmanagement", "projekt", "agil", "scrum", "planung"],
    description: "Methoden des klassischen und agilen Projektmanagements.",
    prerequisites: "Keine.",
    durationHours: 40,
    priceEur: 1190,
    dates: [
      { id: "FX-3002-A", start: "2027-01-25", end: "2027-03-01", location: "Wels", format: "Blended", schedule: "Mo 17:30–21:00", freeSeats: 10 },
    ],
  },
  {
    number: "FX-4001",
    title: "Digital Marketing Grundlagen (fiktiv)",
    category: "Digitalisierung & IT",
    keywords: ["marketing", "social media", "online", "digital", "seo"],
    description: "Social Media, Suchmaschinenoptimierung, Newsletter und Kampagnenplanung.",
    prerequisites: "Keine.",
    durationHours: 56,
    priceEur: 1340,
    dates: [
      { id: "FX-4001-A", start: "2027-02-10", end: "2027-04-07", location: "Online", format: "Online", schedule: "Mi 17:30–21:00", freeSeats: 18 },
    ],
  },
  {
    number: "FX-4002",
    title: "Einstieg in die Programmierung mit Python (fiktiv)",
    category: "Digitalisierung & IT",
    keywords: ["python", "programmieren", "it", "software", "coding", "informatik", "umschulung"],
    description: "Grundlagen der Programmierung für Einsteigerinnen und Einsteiger.",
    prerequisites: "Gute PC-Kenntnisse.",
    durationHours: 60,
    priceEur: 1150,
    dates: [
      { id: "FX-4002-A", start: "2027-01-19", end: "2027-03-23", location: "Linz", format: "Präsenz", schedule: "Di 17:30–21:30", freeSeats: 2 },
      { id: "FX-4002-B", start: "2027-03-03", end: "2027-05-05", location: "Online", format: "Online", schedule: "Mi 18:00–21:30", freeSeats: 20 },
    ],
  },
  {
    number: "FX-4003",
    title: "KI im Arbeitsalltag (fiktiv)",
    category: "Digitalisierung & IT",
    keywords: ["ki", "künstliche intelligenz", "chatgpt", "digital", "automatisierung"],
    description: "Praktischer Einsatz von KI-Werkzeugen im Büro, rechtliche Grundlagen und Grenzen.",
    prerequisites: "Keine.",
    durationHours: 16,
    priceEur: 420,
    dates: [
      { id: "FX-4003-A", start: "2027-01-14", end: "2027-01-21", location: "Online", format: "Online", schedule: "Do 13:00–17:00", freeSeats: 25 },
    ],
  },
  {
    number: "FX-5001",
    title: "Ausbilderkurs mit Ausbilderprüfung (fiktiv)",
    category: "Persönlichkeit & Pädagogik",
    keywords: ["ausbilder", "lehrlinge", "ausbildung", "lehrlingsausbildung", "pädagogik"],
    description: "Vorbereitung auf die Ausbilderprüfung für die Lehrlingsausbildung.",
    prerequisites: "Vollendetes 18. Lebensjahr.",
    durationHours: 40,
    priceEur: 790,
    dates: [
      { id: "FX-5001-A", start: "2027-02-01", end: "2027-02-12", location: "Linz", format: "Präsenz", schedule: "Mo–Fr 8:00–12:00", freeSeats: 6 },
      { id: "FX-5001-B", start: "2027-03-15", end: "2027-03-26", location: "Steyr", format: "Präsenz", schedule: "Mo–Fr 8:00–12:00", freeSeats: 10 },
    ],
  },
  {
    number: "FX-5002",
    title: "Rhetorik und Präsentation (fiktiv)",
    category: "Persönlichkeit & Pädagogik",
    keywords: ["rhetorik", "präsentation", "kommunikation", "auftreten"],
    description: "Sicher auftreten und überzeugend präsentieren.",
    prerequisites: "Keine.",
    durationHours: 16,
    priceEur: 480,
    dates: [
      { id: "FX-5002-A", start: "2027-01-22", end: "2027-01-23", location: "Linz", format: "Präsenz", schedule: "Fr/Sa ganztägig", freeSeats: 9 },
    ],
  },
  {
    number: "FX-6001",
    title: "Heimhilfe Ausbildung (fiktiv)",
    category: "Gesundheit & Soziales",
    keywords: ["heimhilfe", "pflege", "sozial", "betreuung", "gesundheit"],
    description: "Ausbildung zur Heimhilfe nach landesrechtlichen Vorgaben.",
    prerequisites: "Eignungsgespräch; gesundheitliche Eignung.",
    durationHours: 400,
    priceEur: 2100,
    fundingHint: "Förderungen durch AMS/Land möglich – Entscheidung durch Förderstelle.",
    dates: [
      { id: "FX-6001-A", start: "2027-03-01", end: "2027-07-15", location: "Wels", format: "Präsenz", schedule: "Mo–Do 8:00–13:00", freeSeats: 4 },
    ],
  },
  {
    number: "FX-7001",
    title: "Unternehmerprüfung Vorbereitung (fiktiv)",
    category: "Unternehmensgründung",
    keywords: ["unternehmerprüfung", "gründung", "selbstständig", "gewerbe", "unternehmer"],
    description: "Vorbereitung auf die Unternehmerprüfung für reglementierte Gewerbe.",
    prerequisites: "Keine.",
    durationHours: 64,
    priceEur: 890,
    dates: [
      { id: "FX-7001-A", start: "2027-02-02", end: "2027-03-18", location: "Linz", format: "Blended", schedule: "Di/Do 18:00–21:30", freeSeats: 13 },
    ],
  },
  {
    number: "FX-8001",
    title: "Deutsch für den Beruf B1 (fiktiv)",
    category: "Sprachen",
    keywords: ["deutsch", "sprache", "b1", "beruf", "integration"],
    description: "Berufsbezogenes Deutsch auf Niveau B1.",
    prerequisites: "Deutschkenntnisse auf Niveau A2.",
    durationHours: 80,
    priceEur: 640,
    dates: [
      { id: "FX-8001-A", start: "2027-01-11", end: "2027-03-26", location: "Linz", format: "Präsenz", schedule: "Mo/Mi/Fr 18:00–20:30", freeSeats: 7 },
    ],
  },
  {
    number: "FX-8002",
    title: "Business English B2 (fiktiv)",
    category: "Sprachen",
    keywords: ["englisch", "english", "sprache", "business", "b2"],
    description: "Englisch für Meetings, E-Mails und Verhandlungen.",
    prerequisites: "Englisch auf Niveau B1.",
    durationHours: 40,
    priceEur: 560,
    dates: [
      { id: "FX-8002-A", start: "2027-02-03", end: "2027-04-14", location: "Online", format: "Online", schedule: "Mi 18:00–20:00", freeSeats: 12 },
    ],
  },
];

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFC");
}

const STOPWORDS = new Set(
  "der die das den dem des ein eine einen einem einer und oder für fuer mit von im in am an auf zu zum zur ich sie wir mein meine meinen ihr ihre gibt es ist sind wann wo wie was welche welcher welches nächste nächsten naechste kurs kurse kursen kurses termin termine bitte möchte moechte gerne kann können habe hat".split(" "),
);

export interface CourseSearch {
  query?: string;
  category?: string;
  location?: string;
  maxResults?: number;
}

/** Einfache Stichwortsuche über den fiktiven Katalog. */
export function searchCourses({ query, category, location, maxResults = 5 }: CourseSearch): Course[] {
  const terms = normalize(query ?? "")
    .split(/[\s,;/]+/)
    .map((t) => t.replace(/[?!.:"„“()]/g, ""))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
  const scored = COURSES.map((c) => {
    const hay = normalize([c.number, c.title, c.category, c.description, ...c.keywords].join(" "));
    let score = 0;
    for (const t of terms) {
      if (c.keywords.some((k) => normalize(k) === t)) score += 3;
      else if (hay.includes(t)) score += 1;
    }
    if (terms.length === 0) score = 1;
    if (category && !normalize(c.category).includes(normalize(category))) score = 0;
    return { c, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  // Nur Treffer in der Nähe des besten Treffers behalten (vermeidet Zufallstreffer).
  const best = scored[0]?.score ?? 0;
  const relevant = scored.filter((x) => x.score >= best / 2).map((x) => x.c);

  const filtered = location
    ? relevant
        .map((c) => ({ ...c, dates: c.dates.filter((d) => normalize(d.location).includes(normalize(location))) }))
        .filter((c) => c.dates.length > 0)
    : relevant;
  return filtered.slice(0, maxResults);
}

export function getCourse(number: string): Course | undefined {
  return COURSES.find((c) => c.number.toUpperCase() === number.toUpperCase());
}
