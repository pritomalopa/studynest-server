import jwt from "jsonwebtoken";
import { UserRole } from "../types";

export const generateToken = (id: string, role: UserRole): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

  return jwt.sign({ id, role }, secret, { expiresIn });
};
