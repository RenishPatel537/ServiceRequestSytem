import { prisma } from "./prisma";
import { SR_STATUS, TRANSITION_MAP } from "@/types/workflow";

export { SR_STATUS, TRANSITION_MAP };

/**
 * Validates if a status transition is allowed
 */
export function canTransition(current: string, next: string): boolean {
    const allowed = TRANSITION_MAP[current.toUpperCase()];
    return allowed?.includes(next.toUpperCase()) ?? false;
}

/**
 * Interface for the audit record
 */
interface AuditData {
    requestId: number;
    fromStatusId?: number;
    toStatusId: number;
    actorStaffId: number | null;
    actorUserId: number;
    comment: string;
}

/**
 * Creates an audit log entry in the service request history (replies)
 */
export async function createAuditLog(tx: any, data: AuditData) {
    return await tx.servicerequestreply.create({
        data: {
            servicerequestid: data.requestId,
            replydescription: data.comment,
            servicerequeststatusid: data.toStatusId,
            repliedbystaffid: data.actorStaffId,
            repliedbyuserid: data.actorUserId,
            createdat: new Date()
        }
    });
}

/**
 * Helper to get status ID by name
 */
export async function getStatusId(name: string): Promise<number> {
    const status = await prisma.servicerequeststatus.findFirst({
        where: {
            servicerequeststatusname: {
                equals: name,
                mode: 'insensitive'
            }
        },
        select: { servicerequeststatusid: true }
    });

    if (!status) {
        throw new Error(`Status ${name} not found in database.`);
    }

    return status.servicerequeststatusid;
}
