import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["HOD"]);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const allowed = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED", "CLOSED"];

  const statuses = await prisma.servicerequeststatus.findMany({
    where: {
      servicerequeststatusname: { in: allowed },
    },
  });

  const dropdown = statuses.map((s) => ({
    value: s.servicerequeststatusid,
    label: s.servicerequeststatusname,
  }));

  return NextResponse.json(dropdown);
}
