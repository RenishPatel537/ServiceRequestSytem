import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req, ["HOD", "TECHNICIAN"]);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const {id} = await context.params;
  const requestId = Number(id);

  const inProgress = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "IN_PROGRESS" },
  });

  const resolved = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "RESOLVED" },
  });

  const request = await prisma.servicerequest.findUnique({
    where: { servicerequestid: requestId },
  });

  if (
    !request ||
    request.servicerequeststatusid !== inProgress?.servicerequeststatusid
  )
    return NextResponse.json(
      { error: "Only IN_PROGRESS can be resolved" },
      { status: 400 },
    );

  await prisma.servicerequest.update({
    where: { servicerequestid: requestId },
    data: {
      servicerequeststatusid: resolved!.servicerequeststatusid,
      modifiedat: new Date(),
    },
  });

  await prisma.servicerequestreply.create({
    data: {
      servicerequestid: requestId,
      replydescription: "Marked as RESOLVED by HOD",
      servicerequeststatusid: resolved!.servicerequeststatusid,
      repliedbyuserid: auth.userId!,
      repliedbystaffid: auth.staffId!,
    },
  });

  return NextResponse.json({ message: "Resolved successfully" });
}
