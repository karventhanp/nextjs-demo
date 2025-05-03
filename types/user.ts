import { Field } from "./input";
import { UserRole } from "./roles";

export interface UserFormData {
  firstName: Field<string>;
  lastName: Field<string>;
  mailAddress: Field<string>;
  phoneNumber: Field<string>;
  products: Field<string[]>;
  role: Field<string>;
  customers: Field<string[]>;
}

export interface SolinasUserFormData {
  firstName: Field<string>;
  lastName: Field<string>;
  mailAddress: Field<string>;
  products: Field<string[]>;
  customers: Field<string[]>;
}

export interface Credentials {
  temporary: boolean;
  type: "password";
  value: string;
}

export interface Attribute {
  [key: string]: string[];
}

export interface UserPayload {
  enabled: boolean;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  credentials: Credentials[];
  attributes: Attribute;
  organizationId: string;
  clientRoles: {
    [key: string]: UserRole[];
  };
}

export interface UserUpdatePayload {
  enabled?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  attributes?: Attribute;
}

export interface UserData {
  id: string;
  email: string;
  emailVerified: boolean;
  enabled: boolean;
  firstName: string;
  lastName: string;
  membershipType: string;
  notBefore: number;
  totp: boolean;
  createdTimestamp: number;
  requiredActions: string[];
  disableableCredentialTypes: string[];
  attributes: Attribute;
  role: UserRole;
  roleId: string;
}