import { NextResponse } from "next/server";
import { getIdentity, type Identity } from "@/lib/auth/session";
import { getStore } from "@/lib/store";
import type { Case } from "@/lib/types";

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function requireIdentity(): Promise<Identity | NextResponse> {
  const id = await getIdentity();
  return id ?? jsonError(401, "Bitte melden Sie sich mit Ihrem myWIFI-Zugang an.");
}

export async function requireAdmin(): Promise<Identity | NextResponse> {
  const id = await getIdentity();
  if (!id) return jsonError(401, "Nicht angemeldet.");
  if (id.role !== "admin") return jsonError(403, "Keine Berechtigung.");
  return id;
}

/** Lädt einen Fall, wenn die Person ihn sehen darf (eigener Fall oder Admin). */
export async function loadOwnCase(identity: Identity, caseId: string): Promise<Case | NextResponse> {
  const c = await getStore().getCase(caseId);
  if (!c || (c.testerId !== identity.userId && identity.role !== "admin")) return jsonError(404, "Fall nicht gefunden.");
  return c;
}
