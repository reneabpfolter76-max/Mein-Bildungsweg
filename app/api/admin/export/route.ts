import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { buildExport } from "@/lib/report/xlsx";
import { getStore } from "@/lib/store";

export async function GET() {
  const identity = await requireAdmin();
  if (identity instanceof NextResponse) return identity;
  const buf = await buildExport(await getStore().listCases());
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Bildungsnavigator_Export_${date}.xlsx"`,
    },
  });
}
