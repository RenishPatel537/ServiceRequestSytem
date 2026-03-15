import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export type JwtPayload = {
  userId: number;
  username: string;
  roles: string[];
  staffId: number | null;
};

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
