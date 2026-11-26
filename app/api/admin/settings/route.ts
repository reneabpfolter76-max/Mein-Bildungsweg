import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/store";

const schema = z.object({
  dailyMessageLimit: z.number().int().min(1).max(1000),
  monthlyBudgetEur: z.number().min(0).max(100000),
  paused: z.boolean(),
});

export async function POST(req: Request) {
  const identity = await requireAdmin();
  if (identity instanceof NextResponse) return identity;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Ungültige Einstellungen.");
  await getStore().saveSettings(parsed.data);
  return NextResponse.json({ settings: parsed.data });
}
