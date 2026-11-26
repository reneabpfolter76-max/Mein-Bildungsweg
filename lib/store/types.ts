import type { Case, Message, Settings } from "@/lib/types";

/**
 * Speicherschicht. Die Datenbank ist führend (Projektgrundlage Kap. 5);
 * Excel ist nur ein Export.
 */
export interface Store {
  createCase(c: Case): Promise<void>;
  getCase(id: string): Promise<Case | null>;
  saveCase(c: Case): Promise<void>;
  listCases(filter?: { testerId?: string }): Promise<Case[]>;

  addMessage(m: Message): Promise<void>;
  listMessages(caseId: string): Promise<Message[]>;
  /** Anzahl der Nutzernachrichten einer Person seit `sinceIso`. */
  countUserMessagesSince(testerId: string, sinceIso: string): Promise<number>;

  getSettings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;
}
