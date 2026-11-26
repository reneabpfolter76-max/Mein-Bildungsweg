import { describe, expect, it } from "vitest";
import { executeTool } from "@/lib/advisor/tools";
import { createCaseFor } from "@/lib/cases";
import { searchCourses } from "@/lib/data/courses";

const identity = { userId: "T01", customerId: "MW-TEST-0001", profileId: "p1", role: "tester" as const };

describe("Werkzeuge", () => {
  it("dokumentiert Einstiegslevel und Levelwechsel", () => {
    const c = createCaseFor(identity);
    executeTool("fall_aktualisieren", JSON.stringify({ level: "L1", thema: "Excel" }), c);
    executeTool("fall_aktualisieren", JSON.stringify({ level: "L1" }), c);
    executeTool("fall_aktualisieren", JSON.stringify({ level: "L3", level_begruendung: "Neuorientierung" }), c);
    expect(c.entryLevel).toBe("L1");
    expect(c.finalLevel).toBe("L3");
    expect(c.levelChanges.map((l) => l.to)).toEqual(["L1", "L3"]);
    expect(c.topic).toBe("Excel");
  });

  it("übernimmt das Profil aus dem simulierten myWIFI-Konto und ergänzt es", () => {
    const c = createCaseFor(identity);
    expect(c.profile.district).toBe("Linz-Land");
    executeTool("fall_aktualisieren", JSON.stringify({ beratungsprofil: { ziel: "Werkmeister Elektro" } }), c);
    expect(c.profile.goal).toBe("Werkmeister Elektro");
    expect(c.profile.district).toBe("Linz-Land");
  });

  it("simuliert Buchungen nur für existierende Termine", () => {
    const c = createCaseFor(identity);
    const ok = executeTool("termin_simuliert_buchen", JSON.stringify({ kursnummer: "FX-2001", termin_id: "FX-2001-B" }), c) as Record<string, unknown>;
    expect(ok.status).toBe("simuliert gebucht");
    expect(c.bookings).toHaveLength(1);
    expect(c.courseNumbers).toContain("FX-2001");
    const bad = executeTool("termin_simuliert_buchen", JSON.stringify({ kursnummer: "FX-9999", termin_id: "X" }), c) as Record<string, unknown>;
    expect(bad.fehler).toBeDefined();
    expect(c.bookings).toHaveLength(1);
  });

  it("weist ungültige Argumente zurück, ohne den Fall zu verändern", () => {
    const c = createCaseFor(identity);
    const r = executeTool("fall_aktualisieren", JSON.stringify({ level: "L9" }), c) as Record<string, unknown>;
    expect(r.fehler).toBeDefined();
    expect(c.finalLevel).toBeUndefined();
    expect((executeTool("fall_aktualisieren", "{kaputt", c) as Record<string, unknown>).fehler).toBeDefined();
  });

  it("findet Kurse per Stichwort und Ort", () => {
    expect(searchCourses({ query: "Werkmeister" })[0].number).toBe("FX-1001");
    const wels = searchCourses({ query: "werkmeister", location: "Wels" });
    expect(wels[0].dates.every((d) => d.location === "Wels")).toBe(true);
  });
});

describe("Kurssuche", () => {
  it("ignoriert Füllwörter und liefert keine Zufallstreffer", () => {
    const r = searchCourses({ query: "Wann startet der nächste Werkmeister Kurs?" });
    expect(r.map((c) => c.number)).toEqual(["FX-1001"]);
    expect(searchCourses({ query: "Excel Kurs in Wels" })[0].number).toBe("FX-2001");
  });
});
