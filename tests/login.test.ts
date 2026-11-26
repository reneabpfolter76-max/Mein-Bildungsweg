import { describe, expect, it } from "vitest";
import { codeMatches } from "@/lib/auth/provider";

describe("Zugangscode", () => {
  it("toleriert Leerzeichen und Groß-/Kleinschreibung", () => {
    expect(codeMatches(" Pilot2026 ", "pilot2026")).toBe(true);
    expect(codeMatches("pilot2026", "Pilot2026\n")).toBe(true);
    expect(codeMatches("pilot2025", "pilot2026")).toBe(false);
    expect(codeMatches("", "")).toBe(false);
  });
});

import { config, setupStatus } from "@/lib/config";

describe("Konfiguration", () => {
  it("funktioniert ohne SESSION_SECRET und zeigt keine Werte", () => {
    const old = { ...process.env };
    delete process.env.SESSION_SECRET;
    process.env.PILOT_ACCESS_CODE = "  Geheim123 ";
    expect(config.sessionSecret).toMatch(/^[0-9a-f]{64}$/);
    expect(config.pilotAccessCode).toBe("Geheim123");
    const status = setupStatus();
    expect(status.find((s) => s.name === "PILOT_ACCESS_CODE")?.set).toBe(true);
    expect(status.find((s) => s.name === "SESSION_SECRET")?.set).toBe(false);
    expect(JSON.stringify(status)).not.toContain("Geheim123");
    process.env = old;
  });
});
