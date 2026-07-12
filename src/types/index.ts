import { Request } from "express";

export type UserRole = "student" | "admin";

export interface JwtPayload {
  id: string;
  role: UserRole;
}

// Extends Express Request with the authenticated user attached by the auth middleware
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}
