import { timingSafeEqual } from "node:crypto";
import { config } from "@/lib/config";
import { getProfile } from "@/lib/data/profiles";
import type { Identity } from "@/lib/auth/session";

/**
 * Anmeldung = Zugangsvoraussetzung. Der Assistent ist für alle in myWIFI
 * registrierten Personen kostenlos; es gibt keine Bezahlung, aber auch keine
 * anonyme Nutzung.
 *
 * PILOT: simuliertes myWIFI-Login (Testpersonen-ID + Zugangscode + fiktives Profil).
 * PRODUKTION: diese Funktion wird durch die myWIFI-Anmeldung (z. B. OpenID Connect)
 * ersetzt. Der Rest der Anwendung arbeitet nur mit `Identity` und bleibt unverändert.
 */
export interface LoginInput {
  testerId: string;
  accessCode: string;
  profileId: string;
}

export type LoginResult = { ok: true; identity: Identity } | { ok: false; error: string };

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

const TESTER_ID = /^[A-Za-z0-9_-]{2,20}$/;

export function simulatedMyWifiLogin(input: LoginInput): LoginResult {
  const testerId = input.testerId.trim().toUpperCase();
  if (!TESTER_ID.test(testerId)) {
    return { ok: false, error: "Bitte eine Testpersonen-ID angeben (z. B. T01, nur Buchstaben und Ziffern)." };
  }
  let role: Identity["role"];
  if (safeEqual(input.accessCode, config.adminAccessCode)) role = "admin";
  else if (safeEqual(input.accessCode, config.pilotAccessCode)) role = "tester";
  else return { ok: false, error: "Zugangscode ist nicht gültig." };

  const profile = getProfile(input.profileId);
  if (!profile) return { ok: false, error: "Bitte ein Testprofil auswählen." };

  return {
    ok: true,
    identity: { userId: testerId, customerId: profile.customerId, profileId: profile.id, role },
  };
}
