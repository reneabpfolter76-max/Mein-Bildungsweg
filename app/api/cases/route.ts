import { NextResponse } from "next/server";
import { requireIdentity } from "@/lib/auth/guard";
import { effectiveStatus } from "@/lib/cases";
import { getStore } from "@/lib/store";

/** Eigene Fälle der angemeldeten Person (zum Fortsetzen). */
export async function GET() {
  const identity = await requireIdentity();
  if (identity instanceof NextResponse) return identity;
  const cases = await getStore().listCases({ testerId: identity.userId });
  return NextResponse.json({
    cases: cases.map((c) => ({ id: c.id, startedAt: c.startedAt, topic: c.topic, level: c.finalLevel, status: effectiveStatus(c) })),
  });
}
