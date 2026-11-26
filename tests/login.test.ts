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
