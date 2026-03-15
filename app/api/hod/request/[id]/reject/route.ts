import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req, ["HOD"]);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  const requestId = Number(id);

  const rejected = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "REJECTED" },
  });

  const request = await prisma.servicerequest.findUnique({
    where: { servicerequestid: requestId },
  });

  if (!request)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (
    !["PENDING", "IN_PROGRESS"].includes(
      (
        await prisma.servicerequeststatus.findUnique({
          where: { servicerequeststatusid: request.servicerequeststatusid },
        })
      )?.servicerequeststatusname || "",
    )
  )
    return NextResponse.json({ error: "Cannot reject" }, { status: 400 });

  await prisma.servicerequest.update({
    where: { servicerequestid: requestId },
    data: {
      servicerequeststatusid: rejected!.servicerequeststatusid,
      modifiedat: new Date(),
    },
  });

  await prisma.servicerequestreply.create({
    data: {
      servicerequestid: requestId,
      replydescription: "Request Rejected by HOD",
      servicerequeststatusid: rejected!.servicerequeststatusid,
      repliedbyuserid: auth.userId!,
      repliedbystaffid: auth.staffId!,
    },
  });

  return NextResponse.json({ message: "Rejected successfully" });
}
