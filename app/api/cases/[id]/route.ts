import { NextResponse } from "next/server";
import { loadOwnCase, requireIdentity } from "@/lib/auth/guard";
import { getStore } from "@/lib/store";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const identity = await requireIdentity();
  if (identity instanceof NextResponse) return identity;
  const { id } = await ctx.params;
  const c = await loadOwnCase(identity, id);
  if (c instanceof NextResponse) return c;
  return NextResponse.json({ case: c, messages: await getStore().listMessages(c.id) });
}
