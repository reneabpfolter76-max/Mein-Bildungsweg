import { describe, expect, it } from "vitest";
import { checkLimits, createCaseFor, effectiveStatus, monthCostEur } from "@/lib/cases";
import { exportRow } from "@/lib/report/xlsx";
import { computeStats } from "@/lib/stats";
import { classifyDemo } from "@/lib/advisor/demo";
import { DEFAULT_SETTINGS } from "@/lib/types";

const identity = { userId: "T02", customerId: "MW-TEST-0002", profileId: "p2", role: "tester" as const };

describe("Fair-Use", () => {
  it("sperrt bei Tageslimit, Budget oder Pause", () => {
    expect(checkLimits({ settings: DEFAULT_SETTINGS, messagesToday: 0, monthCost: 0 }).ok).toBe(true);
    expect(checkLimits({ settings: DEFAULT_SETTINGS, messagesToday: DEFAULT_SETTINGS.dailyMessageLimit, monthCost: 0 }).ok).toBe(false);
    expect(checkLimits({ settings: DEFAULT_SETTINGS, messagesToday: 0, monthCost: DEFAULT_SETTINGS.monthlyBudgetEur }).ok).toBe(false);
    expect(checkLimits({ settings: { ...DEFAULT_SETTINGS, monthlyBudgetEur: 0 }, messagesToday: 0, monthCost: 999 }).ok).toBe(true);
    expect(checkLimits({ settings: { ...DEFAULT_SETTINGS, paused: true }, messagesToday: 0, monthCost: 0 }).ok).toBe(false);
  });

  it("summiert Kosten nur für den laufenden Monat", () => {
    const now = new Date("2026-11-26T10:00:00Z");
    const a = createCaseFor(identity, now);
    a.costEur = 1.5;
    const b = createCaseFor(identity, new Date("2026-10-01T10:00:00Z"));
    b.costEur = 9;
    expect(monthCostEur([a, b], now)).toBe(1.5);
  });
});

describe("Status und Auswertung", () => {
  it("wertet lange inaktive offene Fälle als Abbruch", () => {
    const c = createCaseFor(identity, new Date("2026-11-26T08:00:00Z"));
    expect(effectiveStatus(c, new Date("2026-11-26T08:10:00Z"))).toBe("offen");
    expect(effectiveStatus(c, new Date("2026-11-26T09:00:00Z"))).toBe("abgebrochen");
    const s = computeStats([c], new Date("2026-11-26T09:00:00Z"));
    expect(s.abandonRate).toBe(100);
  });

  it("exportiert keine Kunden-ID, Namen oder Gesprächsinhalte", () => {
    const c = createCaseFor(identity);
    const row = exportRow(c);
    const text = JSON.stringify(row);
    expect(text).not.toContain("MW-TEST");
    expect(Object.keys(row).some((k) => /name|e-?mail|kunden-id/i.test(k))).toBe(false);
    expect(row["Fall-ID"]).toBe(c.id);
  });
});

describe("Demo-Triage", () => {
  it("ordnet Stichworte den Levels zu", () => {
    expect(classifyDemo("Wann startet der nächste Excel-Kurs?")).toBe("L1");
    expect(classifyDemo("Kann ich die LAP nachholen?")).toBe("L2");
    expect(classifyDemo("Ich möchte mich beruflich neu orientieren")).toBe("L3");
    expect(classifyDemo("Hallo")).toBeNull();
  });
});
