import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

export const SESSION_COOKIE = "bn_session";
const SESSION_HOURS = 12;

export type Role = "tester" | "admin";

/**
 * Angemeldete Person. Im Pilot stammt die Identität aus dem simulierten
 * myWIFI-Login, später aus der echten myWIFI-Anmeldung (siehe provider.ts).
 */
export interface Identity {
  /** Testpersonen-ID (Pilot) bzw. pseudonyme Nutzer-ID (Produktion). */
  userId: string;
  /** myWIFI-Kunden-ID (im Pilot fiktiv). */
  customerId: string;
  profileId: string;
  role: Role;
}

function key(): Uint8Array {
  return new TextEncoder().encode(config.sessionSecret);
}

export async function signSession(identity: Identity): Promise<string> {
  return new SignJWT({ ...identity })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<Identity | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    const { userId, customerId, profileId, role } = payload as Record<string, unknown>;
    if (typeof userId !== "string" || typeof customerId !== "string" || typeof profileId !== "string") return null;
    if (role !== "tester" && role !== "admin") return null;
    return { userId, customerId, profileId, role };
  } catch {
    return null;
  }
}

export async function getIdentity(): Promise<Identity | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 3600,
};
