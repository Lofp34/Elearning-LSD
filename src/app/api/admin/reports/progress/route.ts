import { NextResponse } from "next/server";
import { getAuthUserScope, isAdminRole } from "@/lib/authz";
import {
  convertProgressRowsToCsv,
  getProgressReportRows,
} from "@/lib/reporting/progress-report";

export const runtime = "nodejs";

export async function GET() {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const rows = await getProgressReportRows(authUser);
  const csv = convertProgressRowsToCsv(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="progress-report.csv"',
    },
  });
}
