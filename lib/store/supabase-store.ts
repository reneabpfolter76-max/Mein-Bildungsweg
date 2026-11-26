import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Store } from "@/lib/store/types";
import { DEFAULT_SETTINGS, type Case, type Message, type Settings } from "@/lib/types";

/**
 * Supabase (Postgres, EU-Region). Schema: supabase/schema.sql.
 * Zugriff ausschließlich serverseitig mit dem Service-Role-Key;
 * Row Level Security ist aktiv und sperrt direkten Client-Zugriff.
 */
export class SupabaseStore implements Store {
  private db: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.db = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  }

  private static check<T>(res: { data: T; error: { message: string } | null }): T {
    if (res.error) throw new Error(`Datenbankfehler: ${res.error.message}`);
    return res.data;
  }

  private static row(c: Case) {
    return {
      id: c.id,
      tester_id: c.testerId,
      status: c.status,
      started_at: c.startedAt,
      last_activity_at: c.lastActivityAt,
      data: c,
    };
  }

  async createCase(c: Case) {
    SupabaseStore.check(await this.db.from("cases").insert(SupabaseStore.row(c)));
  }
  async getCase(id: string) {
    const data = SupabaseStore.check(await this.db.from("cases").select("data").eq("id", id).maybeSingle());
    return (data?.data as Case | undefined) ?? null;
  }
  async saveCase(c: Case) {
    SupabaseStore.check(await this.db.from("cases").upsert(SupabaseStore.row(c)));
  }
  async listCases(filter?: { testerId?: string }) {
    let q = this.db.from("cases").select("data").order("started_at", { ascending: false });
    if (filter?.testerId) q = q.eq("tester_id", filter.testerId);
    const data = SupabaseStore.check(await q);
    return (data ?? []).map((r) => r.data as Case);
  }
  async addMessage(m: Message) {
    SupabaseStore.check(
      await this.db.from("messages").insert({
        id: m.id,
        case_id: m.caseId,
        tester_id: m.testerId,
        role: m.role,
        content: m.content,
        sources: m.sources ?? null,
        created_at: m.createdAt,
      }),
    );
  }
  async listMessages(caseId: string) {
    const data = SupabaseStore.check(
      await this.db.from("messages").select("*").eq("case_id", caseId).order("created_at", { ascending: true }),
    );
    return (data ?? []).map(
      (r): Message => ({
        id: r.id,
        caseId: r.case_id,
        testerId: r.tester_id,
        role: r.role,
        content: r.content,
        sources: r.sources ?? undefined,
        createdAt: r.created_at,
      }),
    );
  }
  async countUserMessagesSince(testerId: string, sinceIso: string) {
    const res = await this.db
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("tester_id", testerId)
      .eq("role", "user")
      .gte("created_at", sinceIso);
    if (res.error) throw new Error(`Datenbankfehler: ${res.error.message}`);
    return res.count ?? 0;
  }
  async getSettings() {
    const data = SupabaseStore.check(await this.db.from("settings").select("value").eq("key", "app").maybeSingle());
    return { ...DEFAULT_SETTINGS, ...((data?.value as Partial<Settings>) ?? {}) };
  }
  async saveSettings(s: Settings) {
    SupabaseStore.check(await this.db.from("settings").upsert({ key: "app", value: s }));
  }
}
