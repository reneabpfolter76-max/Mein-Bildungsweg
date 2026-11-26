import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, loadOwnCase, requireIdentity } from "@/lib/auth/guard";
import { getStore } from "@/lib/store";

const score = z.number().int().min(1).max(5);
const schema = z.object({
  ratings: z.object({
    correctness: score,
    timeliness: score,
    completeness: score,
    sourceQuality: score,
    clarity: score,
    fit: score,
    usability: score,
    levelAssignment: score,
  }),
  customerRelease: z.enum(["ja", "nach_ueberarbeitung", "nein"]),
  errorDescription: z.string().max(4000).optional(),
  feedback: z.string().max(4000).optional(),
  uncoveredNeed: z.string().max(1000).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const identity = await requireIdentity();
  if (identity instanceof NextResponse) return identity;
  const { id } = await ctx.params;
  const c = await loadOwnCase(identity, id);
  if (c instanceof NextResponse) return c;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Bitte alle Bewertungen (1–5) und die Kundenfreigabe angeben.");
  const f = parsed.data;
  c.ratings = f.ratings;
  c.customerRelease = f.customerRelease;
  c.errorDescription = f.errorDescription?.trim() || undefined;
  c.feedback = f.feedback?.trim() || undefined;
  if (f.uncoveredNeed?.trim()) c.uncoveredNeed = f.uncoveredNeed.trim();
  await getStore().saveCase(c);
  return NextResponse.json({ case: c });
}
