import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["HOD"]);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const dept = await prisma.servicedeptperson.findFirst({
    where: { staffid: auth.staffId!, todate: null },
  });

  if (!dept)
    return NextResponse.json(
      { error: "Department not found" },
      { status: 404 },
    );

  const staff = await prisma.servicedeptperson.findMany({
    where: {
      servicedeptid: dept.servicedeptid,
      todate: null,
    },
    include: { staff: true },
  });

  const dropdown = staff.map((s) => ({
    value: s.staff.staffid,
    label: s.staff.fullname + "(" + s.staff.staffcode + ")",
  }));

  return NextResponse.json(dropdown);
}
