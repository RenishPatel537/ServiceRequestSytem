import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["TECHNICIAN"]);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const statuses = await prisma.servicerequeststatus.findMany();

  const result: any = {};

  for (const status of statuses) {
    const count = await prisma.servicerequest.count({
      where: {
        assignedtostaffid: auth.staffId,
        servicerequeststatusid: status.servicerequeststatusid,
      },
    });

    result[status.servicerequeststatusname] = count;
  }

  return NextResponse.json(result);
}
