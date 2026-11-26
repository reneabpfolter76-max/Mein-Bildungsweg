export type Level = "L1" | "L2" | "L3";

export type CaseStatus = "offen" | "abgeschlossen" | "abgebrochen" | "uebergeben";

export type CustomerRelease = "ja" | "nach_ueberarbeitung" | "nein";

/** Beratungsprofil gemäß Projektgrundlage, Kapitel 5 (keine Klarnamen). */
export interface AdvisoryProfile {
  ageGroup?: string;
  education?: string;
  workExperience?: string;
  employment?: string;
  district?: string;
  goal?: string;
}

export interface LevelChange {
  from: Level | null;
  to: Level;
  at: string;
  reason?: string;
}

export interface Source {
  url: string;
  title: string;
  retrievedAt: string;
}

export interface Handover {
  target: string;
  channel: "telefon" | "video" | "vor_ort" | "offen";
  summary: string;
  openQuestions?: string[];
  at: string;
}

export interface SimulatedBooking {
  courseNumber: string;
  dateId: string;
  confirmation: string;
  at: string;
}

export interface Ratings {
  correctness: number;
  timeliness: number;
  completeness: number;
  sourceQuality: number;
  clarity: number;
  fit: number;
  usability: number;
  levelAssignment: number;
}

export const RATING_LABELS: Record<keyof Ratings, string> = {
  correctness: "Fachliche Richtigkeit",
  timeliness: "Aktualität",
  completeness: "Vollständigkeit",
  sourceQuality: "Quellenqualität",
  clarity: "Verständlichkeit",
  fit: "Passgenauigkeit",
  usability: "Benutzerfreundlichkeit",
  levelAssignment: "Levelzuordnung",
};

export interface Case {
  id: string;
  testerId: string;
  /** Simulierte myWIFI-Kunden-ID (fiktiv). */
  customerId: string;
  startedAt: string;
  lastActivityAt: string;
  endedAt?: string;
  status: CaseStatus;

  profile: AdvisoryProfile;

  entryLevel?: Level;
  finalLevel?: Level;
  levelChanges: LevelChange[];
  levelReason?: string;
  topic?: string;
  recommendations: string[];
  courseNumbers: string[];
  costs?: string;
  funding?: string;
  educationPlan?: string;
  summary?: string;
  bookings: SimulatedBooking[];
  handover?: Handover;

  sources: Source[];
  researchDate?: string;
  model: string;
  promptVersion: string;
  errors: string[];

  ratings?: Ratings;
  feedback?: string;
  customerRelease?: CustomerRelease;
  errorDescription?: string;
  uncoveredNeed?: string;

  tokensIn: number;
  tokensOut: number;
  webSearchCalls: number;
  costEur: number;
}

export interface Message {
  id: string;
  caseId: string;
  testerId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: Source[];
}

export interface Settings {
  /** Fair-Use-Limit: Nachrichten pro Person und Kalendertag. */
  dailyMessageLimit: number;
  /** Kostenobergrenze pro Kalendermonat in Euro (geschätzt). */
  monthlyBudgetEur: number;
  /** Assistent kann vom Admin pausiert werden. */
  paused: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  dailyMessageLimit: 40,
  monthlyBudgetEur: 50,
  paused: false,
};
