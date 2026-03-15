import { UserRole } from '@/types/auth';

export const PERMISSIONS = {
    [UserRole.ADMIN]: ['manage_users', 'manage_roles', 'view_all_requests'],
    [UserRole.REQUESTOR]: ['create_request', 'view_my_requests'],
    [UserRole.TECHNICIAN]: ['view_assigned_requests', 'update_request_status'],
    [UserRole.HOD]: ['approve_requests', 'view_dept_requests'],
};

export function hasPermission(role: UserRole, permission: string): boolean {
    const rolePermissions = PERMISSIONS[role];
    return rolePermissions ? rolePermissions.includes(permission) : false;
}
