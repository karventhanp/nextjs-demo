import { Option } from "./input";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  VIEWER = "viewer",
  FSA = "fsa",
}

export interface AllowedActions {
  view: boolean;
  edit: boolean;
  create: boolean;
  delete: boolean;
  download: boolean;
  fsa_management: boolean;
  user_management: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
  userId: string;
}

export const Roles: Record<UserRole, Option> = {
  [UserRole.SUPER_ADMIN]: {
    label: "Super Admin",
    name: UserRole.SUPER_ADMIN,
    value: UserRole.SUPER_ADMIN,
    className: "border-lavender text-purple bg-purple/5",
  },
  [UserRole.ADMIN]: {
    label: "Admin",
    name: UserRole.ADMIN,
    value: UserRole.ADMIN,
    className: "border-glitter text-royalBlue bg-royalBlue/5",
  },
  [UserRole.FSA]: {
    label: "FSA",
    name: UserRole.FSA,
    value: UserRole.FSA,
    className: "border-almond text-tangelo bg-tangelo/5",
  },
  [UserRole.VIEWER]: {
    label: "Viewer",
    name: UserRole.VIEWER,
    value: UserRole.VIEWER,
    className: "border-wolf text-charcoal bg-charcoal/5",
  },
} as const;

export const RoleClass: Record<string, string> = {
  [UserRole.SUPER_ADMIN]:
    "border-lavender text-purple bg-purple/5 p-1 text-xs rounded-md",
  [UserRole.ADMIN]:
    "border-glitter text-royalBlue bg-royalBlue/5 p-1 text-xs rounded-md",
  [UserRole.FSA]:
    "border-almond text-tangelo bg-tangelo/5 p-1 text-xs rounded-md",
  [UserRole.VIEWER]:
    "border-wolf text-charcoal bg-charcoal/5 p-1 text-xs rounded-md",
} as const;

export interface UserRolePayload {
  id: string;
  name: string;
}