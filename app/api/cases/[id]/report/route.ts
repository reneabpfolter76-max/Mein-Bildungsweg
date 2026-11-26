import { NextResponse } from "next/server";
import { loadOwnCase, requireIdentity } from "@/lib/auth/guard";
import { buildCaseReport } from "@/lib/report/docx";
import { getStore } from "@/lib/store";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const identity = await requireIdentity();
  if (identity instanceof NextResponse) return identity;
  const { id } = await ctx.params;
  const c = await loadOwnCase(identity, id);
  if (c instanceof NextResponse) return c;
  const buf = await buildCaseReport(c, await getStore().listMessages(c.id));
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="Beratungsbericht_${c.id}.docx"`,
    },
  });
}
