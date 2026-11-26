import { NextResponse } from "next/server";
import { jsonError, loadOwnCase, requireIdentity } from "@/lib/auth/guard";
import { getStore } from "@/lib/store";

/** Fall abschließen oder abbrechen. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const identity = await requireIdentity();
  if (identity instanceof NextResponse) return identity;
  const { id } = await ctx.params;
  const c = await loadOwnCase(identity, id);
  if (c instanceof NextResponse) return c;
  const { status } = (await req.json().catch(() => ({}))) as { status?: string };
  if (status !== "abgeschlossen" && status !== "abgebrochen") return jsonError(400, "Ungültiger Status.");
  if (c.status === "offen") {
    c.status = status === "abgeschlossen" && c.handover ? "uebergeben" : status;
    c.endedAt = new Date().toISOString();
    await getStore().saveCase(c);
  }
  return NextResponse.json({ case: c });
}
