import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req, ["HOD"]);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  const requestId = Number(id);

  const resolved = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "RESOLVED" },
  });

  const closed = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "CLOSED" },
  });

  const request = await prisma.servicerequest.findUnique({
    where: { servicerequestid: requestId },
  });

  if (
    !request ||
    request.servicerequeststatusid !== resolved?.servicerequeststatusid
  )
    return NextResponse.json(
      { error: "Only RESOLVED can be closed" },
      { status: 400 },
    );

  await prisma.servicerequest.update({
    where: { servicerequestid: requestId },
    data: {
      servicerequeststatusid: closed!.servicerequeststatusid,
      modifiedat: new Date(),
    },
  });

  await prisma.servicerequestreply.create({
    data: {
      servicerequestid: requestId,
      replydescription: "Closed by HOD",
      servicerequeststatusid: closed!.servicerequeststatusid,
      repliedbyuserid: auth.userId!,
      repliedbystaffid: auth.staffId!,
    },
  });

  return NextResponse.json({ message: "Closed successfully" });
}
