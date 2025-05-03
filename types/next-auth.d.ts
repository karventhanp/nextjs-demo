import NextAuth, { DefaultSession, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { UserRole } from "./roles";
import { OrganizationInfo } from "./auth";

declare module "next-auth" {
  interface Session {
    error?: "RefreshTokenError";
    id_token?: string;
    access_token?: string;
    sub?: string;
    organization: OrganizationInfo | null;
    assignedCustomers: AssignedCustomers | null;
    user?: {
      roles?: UserRole[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token: string;
    expires_at: number;
    refresh_token?: string;
    id_token?: string;
    error?: "RefreshTokenError";
    organization: OrganizationInfo | null;
    roles?: UserRole[];
    sub?: string;
  }
}