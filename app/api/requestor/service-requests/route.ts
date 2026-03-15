import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { UserRole } from "@/types/auth"; // Import UserRole enum


// GET user's requests
export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["REQUESTOR", "ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const requests = await prisma.servicerequest.findMany({
            where: {
                createdbyuserid: auth.userId,
            },
            include: {
                servicerequeststatus: true,
                servicerequesttype: true,
            },
            orderBy: { createdat: "desc" },
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching service requests:", error);
        return NextResponse.json({ error: "Failed to fetch service requests" }, { status: 500 });
    }
}

// POST create service request
export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["REQUESTOR"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const contentType = req.headers.get("content-type") || "";
        let serviceRequestTypeId, title, description, file = null;

        if (contentType.includes("application/json")) {
            const body = await req.json();
            serviceRequestTypeId = body.serviceRequestTypeId;
            title = body.title;
            description = body.description;
        } else {
            const formData = await req.formData();
            serviceRequestTypeId = formData.get("serviceRequestTypeId");
            title = formData.get("title");
            description = formData.get("description");
            file = formData.get("attachment") as File | null;
        }

        if (!serviceRequestTypeId || !title || !description) {
            return NextResponse.json(
                { error: "Request Type, Title, and Description are required" },
                { status: 400 }
            );
        }

        // 2. Fetch RequesterStaffID (Optional)
        const userStaff = await prisma.userstaff.findFirst({
            where: {
                userid: auth.userId,
            },
        });

        const requesterStaffId = userStaff?.staffid || null;


        // 3. Fetch ServiceRequestType details to derive ServiceDeptID and defaultPriorityLevel
        const serviceRequestType = await prisma.servicerequesttype.findUnique({
            where: {
                servicerequesttypeid: Number(serviceRequestTypeId),
            },
        });

        if (!serviceRequestType) {
            return NextResponse.json(
                { error: "Invalid Service Request Type provided." },
                { status: 400 }
            );
        }
        const serviceDeptId = serviceRequestType.servicedeptid;
        const defaultPriorityLevel = serviceRequestType.defaultprioritylevel;


        // 4. Generate SR No (SR-YYYYMMDD-XXXX)
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

        // Find last SR number for today
        const lastRequest = await prisma.servicerequest.findFirst({
            where: {
                servicerequestno: {
                    startsWith: `SR-${dateStr}-`,
                },
            },
            orderBy: {
                servicerequestno: "desc",
            },
        });

        let nextSeq = 1;
        if (lastRequest) {
            const parts = lastRequest.servicerequestno.split("-");
            nextSeq = parseInt(parts[2]) + 1;
        }
        const srNo = `SR-${dateStr}-${nextSeq.toString().padStart(4, "0")}`;


        // 5. Find "PENDING" status ID
        const pendingStatus = await prisma.servicerequeststatus.findFirst({
            where: {
                servicerequeststatusname: {
                    equals: "PENDING", // Changed from "OPEN" to "PENDING"
                    mode: "insensitive",
                },
            },
        });

        if (!pendingStatus) {
            return NextResponse.json(
                { error: "System status 'PENDING' not configured" },
                { status: 500 }
            );
        }


        // 6. Handle Transactional Insert
        const newRequest = await prisma.$transaction(async (tx) => {
            const sr = await tx.servicerequest.create({
                data: {
                    servicerequestno: srNo,
                    servicerequestdatetime: new Date(),
                    requesterstaffid: requesterStaffId, // Set from fetched userStaff
                    servicerequesttypeid: Number(serviceRequestTypeId),
                    servicerequesttitle: title as string,
                    servicerequestdescription: description as string,
                    servicerequeststatusid: pendingStatus.servicerequeststatusid, // Set to PENDING status ID
                    assignedtostaffid: null, // As per requirements
                    assignedbyuserid: null, // As per requirements
                    assigneddatetime: null, // As per requirements
                    prioritylevel: defaultPriorityLevel, // Set from serviceRequestType
                    approvalstatus: null, // As per requirements
                    createdbyuserid: auth.userId,
                    createdat: new Date(),
                    modifiedat: new Date(),
                    // servicedeptid is not directly in servicerequest, it's derived via servicerequesttype
                },
            });

            // Handle Attachment
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const originalName = file.name;
                const extension = path.extname(originalName);
                const fileName = `${sr.servicerequestid}_${Date.now()}${extension}`;
                const uploadDir = path.join(process.cwd(), "public/uploads");

                // Ensure upload directory exists
                await mkdir(uploadDir, { recursive: true });

                const filePath = path.join(uploadDir, fileName);
                await writeFile(filePath, buffer);

                await tx.servicerequestattachment.create({
                    data: {
                        servicerequestid: sr.servicerequestid,
                        filepath: `/uploads/${fileName}`,
                        originalfilename: originalName,
                        uploadedbyuserid: auth.userId,
                        uploadedat: new Date(),
                    },
                });
            }

            return sr;
        });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error: any) {
        console.error("Error creating service request:", error);
        // Handle specific Prisma errors if needed
        return NextResponse.json({ error: "Failed to create service request" }, { status: 500 });
    }
}
