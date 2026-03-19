import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { number, string } from "zod";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN"]);

  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // const a: { servicedeptname: string; total_req: number }[] =
  //   await prisma.$queryRaw`
  //   select sd.servicedeptname, count(sr.servicerequestid)::int as "total_req"
  //   from servicerequest sr
  //   join servicerequesttype srt
  //   on sr.servicerequesttypeid = srt.servicerequesttypeid
  //   join servicedept sd
  //   on srt.servicedeptid = sd.servicedeptid
  //   group by sd.servicedeptid,sd.servicedeptname
  // `;

  // const formated = a.map((item: any) => ({
  //   servicedeptname: item.servicedeptname,
  //   total_req: Number(item.total_req),
  // }));

  // return NextResponse.json({ data: a });

  //Overall Summary
  const summaryRaw: any[] = await prisma.$queryRaw`
    SELECT srs.servicerequeststatusname, COUNT(sr.servicerequestid)::int as count
    FROM servicerequest sr
    JOIN servicerequeststatus srs
      ON sr.servicerequeststatusid = srs.servicerequeststatusid
    GROUP BY srs.servicerequeststatusname
  `;

  const summary: any = {
    total: 0,
    PENDING: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    REJECTED: 0,
    CLOSED: 0,
  };

  summaryRaw.forEach((item) => {
    const key = item.servicerequeststatusname;
    summary[key] = Number(item.count);
    summary.total += Number(item.count);
  });

  //Department-wise count
  const deptRaw: any[] = await prisma.$queryRaw`
    SELECT sd.servicedeptname, COUNT(sr.servicerequestid)::int as total_req
    FROM servicerequest sr
    JOIN servicerequesttype srt
      ON sr.servicerequesttypeid = srt.servicerequesttypeid
    JOIN servicedept sd
      ON srt.servicedeptid = sd.servicedeptid
    GROUP BY sd.servicedeptid, sd.servicedeptname
  `;

  const departmentStats = deptRaw.map((d) => ({
    name: d.servicedeptname,
    total: Number(d.total_req),
  }));

  //Status-wise distribution
  const statusStats = summaryRaw.map((s) => ({
    status: s.servicerequeststatusname,
    count: Number(s.count),
  }));

  return NextResponse.json({
    summary,
    departmentStats,
    statusStats,
  });
}
