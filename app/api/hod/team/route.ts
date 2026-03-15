import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { error } from "console";

export async function GET(req: NextRequest) {
  //Authenticate HOD
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
      todate: null,
    },
  });

  if (!deptPerson) {
    return NextResponse.json(
      { error: "Department not found" },
      { status: 404 },
    );
  }

  // Get IN_PROGRESS status ID
  const inProgressStatus = await prisma.servicerequeststatus.findFirst({
    where: { servicerequeststatusname: "IN_PROGRESS" },
  });

  if (!inProgressStatus) {
    return NextResponse.json({ error: "Status not found" }, { status: 404 });
  }

  // Get staff of this department
  const staffList = await prisma.servicedeptperson.findMany({
    where: {
      servicedeptid: deptPerson.servicedeptid,
      todate: null,
    },
    include: {
      staff: true,
    },
  });

  //For each staff, count IN_PROGRESS assigned requests
  const result = await Promise.all(
    staffList.map(async (item) => {
      const count = await prisma.servicerequest.count({
        where: {
          assignedtostaffid: item.staffid,
          servicerequeststatusid: inProgressStatus.servicerequeststatusid,
        },
      });

      return {
        staffId: item.staff.staffid,
        name: item.staff.fullname,
        email: item.staff.email,
        mobile: item.staff.mobile,
        inProgressCount: count,
      };
    }),
  );

  return NextResponse.json(result);
}
