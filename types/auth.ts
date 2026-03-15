export enum UserRole {
  ADMIN = "ADMIN",
  REQUESTOR = "REQUESTOR",
  TECHNICIAN = "TECHNICIAN",
  HOD = "HOD",
}

export interface UserContext {
  userId: number;
  username: string;
  roles: string[];
  staffId?: number | null;
}

export interface SessionPayload extends UserContext {
  expires: Date;
}
