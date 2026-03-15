import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["TECHNICIAN"]);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const status = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "CLOSED" },
  });

  const requests = await prisma.servicerequest.findMany({
    where: {
      assignedtostaffid: auth.staffId,
      servicerequeststatusid: status?.servicerequeststatusid,
    },
    include: {
      servicerequesttype: true,
    },
  });

  return NextResponse.json(requests);
}
