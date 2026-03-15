import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { error } from "console";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req, ["HOD"]);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  const requestId = Number(id);

  const { technicianId } = await req.json();
  console.log(technicianId);

  if (!auth.staffId) {
    console.log("not ");
    return NextResponse.json({ error: "Not a staff Member" }, { status: 403 });
  }

  // Get HOD department
  const dept = await prisma.servicedeptperson.findFirst({
    where: { staffid: auth.staffId, todate: null },
  });

  if (!dept)
    return NextResponse.json(
      { error: "Department not found" },
      { status: 404 },
    );

  // Get request with department
  const request = await prisma.servicerequest.findUnique({
    where: { servicerequestid: requestId },
    include: { servicerequesttype: true },
  });

  if (
    !request ||
    request.servicerequesttype.servicedeptid !== dept.servicedeptid
  )
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pending = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "PENDING" },
  });

  const inProgress = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "IN_PROGRESS" },
  });

  if (request.servicerequeststatusid !== pending?.servicerequeststatusid)
    return NextResponse.json(
      { error: "Only PENDING can be assigned" },
      { status: 400 },
    );

  // Update request
  await prisma.servicerequest.update({
    where: { servicerequestid: requestId },
    data: {
      assignedtostaffid: technicianId,
      assignedbyuserid: auth.userId,
      assigneddatetime: new Date(),
      servicerequeststatusid: inProgress?.servicerequeststatusid,
      modifiedat: new Date(),
    },
  });

  // Log
  await prisma.servicerequestreply.create({
    data: {
      servicerequestid: requestId,
      replydescription: "Assigned to technician",
      servicerequeststatusid: inProgress!.servicerequeststatusid,
      repliedbyuserid: auth.userId!,
      repliedbystaffid: auth.staffId!,
    },
  });

  return NextResponse.json({ message: "Assigned successfully" });
}
