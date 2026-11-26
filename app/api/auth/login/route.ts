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
  const res = NextResponse.json({ ok: true, role: result.identity.role });
  res.cookies.set(SESSION_COOKIE, await signSession(result.identity), sessionCookieOptions);
  return res;
}
