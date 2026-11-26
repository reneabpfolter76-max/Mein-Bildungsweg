import { promises as fs } from "node:fs";
import path from "node:path";
import type { Store } from "@/lib/store/types";
import { DEFAULT_SETTINGS, type Case, type Message, type Settings } from "@/lib/types";

interface Data {
  cases: Case[];
  messages: Message[];
  settings: Settings;
}

/**
 * Lokale JSON-Datei – NUR für Entwicklung und Demo auf einem einzelnen Rechner.
 * Auf Vercel ist das Dateisystem nicht dauerhaft; dort Supabase verwenden.
 */
export class FileStore implements Store {
  private file: string;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(dir: string) {
    this.file = path.join(dir, "store.json");
  }

  private async read(): Promise<Data> {
    try {
      const raw = await fs.readFile(this.file, "utf8");
      const d = JSON.parse(raw) as Partial<Data>;
      return { cases: d.cases ?? [], messages: d.messages ?? [], settings: { ...DEFAULT_SETTINGS, ...d.settings } };
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") {
        return { cases: [], messages: [], settings: { ...DEFAULT_SETTINGS } };
      }
      throw e;
    }
  }

  private async write(d: Data): Promise<void> {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(d, null, 2), "utf8");
    await fs.rename(tmp, this.file);
  }

  /** Serialisiert Schreibzugriffe innerhalb des Prozesses. */
  private mutate<T>(fn: (d: Data) => T): Promise<T> {
    const run = this.queue.then(async () => {
      const d = await this.read();
      const result = fn(d);
      await this.write(d);
      return result;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  async createCase(c: Case) {
    await this.mutate((d) => void d.cases.push(c));
  }
  async getCase(id: string) {
    await this.queue;
    return (await this.read()).cases.find((c) => c.id === id) ?? null;
  }
  async saveCase(c: Case) {
    await this.mutate((d) => {
      const i = d.cases.findIndex((x) => x.id === c.id);
      if (i >= 0) d.cases[i] = c;
      else d.cases.push(c);
    });
  }
  async listCases(filter?: { testerId?: string }) {
    await this.queue;
    const cases = (await this.read()).cases;
    return (filter?.testerId ? cases.filter((c) => c.testerId === filter.testerId) : cases).sort((a, b) =>
      b.startedAt.localeCompare(a.startedAt),
    );
  }
  async addMessage(m: Message) {
    await this.mutate((d) => void d.messages.push(m));
  }
  async listMessages(caseId: string) {
    await this.queue;
    return (await this.read()).messages
      .filter((m) => m.caseId === caseId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  async countUserMessagesSince(testerId: string, sinceIso: string) {
    await this.queue;
    return (await this.read()).messages.filter(
      (m) => m.testerId === testerId && m.role === "user" && m.createdAt >= sinceIso,
    ).length;
  }
  async getSettings() {
    await this.queue;
    return (await this.read()).settings;
  }
  async saveSettings(s: Settings) {
    await this.mutate((d) => void (d.settings = s));
  }
}
