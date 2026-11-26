import { NextResponse } from "next/server";
import { simulatedMyWifiLogin } from "@/lib/auth/provider";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const result = simulatedMyWifiLogin({
    testerId: String(body.testerId ?? ""),
    accessCode: String(body.accessCode ?? ""),
    profileId: String(body.profileId ?? ""),
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 401 });
  try {
    const res = NextResponse.json({ ok: true, role: result.identity.role });
    res.cookies.set(SESSION_COOKIE, await signSession(result.identity), sessionCookieOptions);
    return res;
  } catch (e) {
    console.error("Anmeldung fehlgeschlagen", e);
    return NextResponse.json({ error: "Technischer Fehler bei der Anmeldung. Bitte „Einrichtung prüfen“ öffnen." }, { status: 500 });
  }
}
