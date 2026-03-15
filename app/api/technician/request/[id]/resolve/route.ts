import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: any) {
  const auth = await requireAuth(req, ["TECHNICIAN"]);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const requestId = Number(params.id);

  const inProgress = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "IN_PROGRESS" },
  });

  const resolved = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "RESOLVED" },
  });

  const request = await prisma.servicerequest.findUnique({
    where: { servicerequestid: requestId },
  });

  if (!request)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Must be assigned to this technician
  if (request.assignedtostaffid !== auth.staffId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Must be IN_PROGRESS
  if (request.servicerequeststatusid !== inProgress?.servicerequeststatusid)
    return NextResponse.json(
      { error: "Only IN_PROGRESS can be resolved" },
      { status: 400 },
    );

  // Critical priority check
  if (request.prioritylevel === "Critical")
    return NextResponse.json(
      { error: "Critical requests must be resolved by HOD" },
      { status: 400 },
    );

  // Update request
  await prisma.servicerequest.update({
    where: { servicerequestid: requestId },
    data: {
      servicerequeststatusid: resolved!.servicerequeststatusid,
      modifiedat: new Date(),
    },
  });

  // Log
  await prisma.servicerequestreply.create({
    data: {
      servicerequestid: requestId,
      replydescription: "Resolved by Technician",
      servicerequeststatusid: resolved!.servicerequeststatusid,
      repliedbyuserid: auth.userId!,
      repliedbystaffid: auth.staffId!,
    },
  });

  return NextResponse.json({ message: "Resolved successfully" });
}
