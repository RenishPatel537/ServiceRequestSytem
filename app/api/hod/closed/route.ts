import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { error } from "console";

export async function GET(req: NextRequest) {
  // Authenticate
  const auth = await requireAuth(req, ["HOD"]);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!auth.staffId) {
    return NextResponse.json({ error: "Not in Staff Member" }, { status: 403 });
  }

  // Get HOD department
  const deptPerson = await prisma.servicedeptperson.findFirst({
    where: {
      staffid: auth.staffId,
      todate: null, // active mapping
    },
  });

  if (!deptPerson) {
    return NextResponse.json(
      { error: "Department not found" },
      { status: 404 },
    );
  }

  // Get PENDING status ID
  const pendingStatus = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "CLOSED" },
  });

  if (!pendingStatus) {
    return NextResponse.json({ error: "Status not found" }, { status: 404 });
  }

  // Fetch only department pending requests
  const requests = await prisma.servicerequest.findMany({
    where: {
      servicerequeststatusid: pendingStatus.servicerequeststatusid,
      servicerequesttype: {
        servicedeptid: deptPerson.servicedeptid,
      },
    },
    include: {
      servicerequesttype: true,
    },
  });

  return NextResponse.json(requests);
}
