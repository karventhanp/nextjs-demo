import { Zones } from "./inpection";
import { Field, Option } from "./input";
import { Attribute, UserData } from "./user";

export interface CustomerDetailsFormData {
  name: Field<string>;
  typeOfPipeLine: Field<string>;
  registerNumber: Field<string>;
  gstin: Field<string>;
  agreementDate: Field<string>;
  phoneNumber: Field<string>;
  mailAddress: Field<string>;
  street: Field<string>;
  area: Field<string>;
  landmark: Field<string>;
  pincode: Field<string>;
  country: Field<string>;
  state: Field<string>;
  district: Field<string>;
}

export interface CompanyPocFormData {
  firstName: Field<string>;
  lastName: Field<string>;
  email: Field<string>;
  phoneNumber: Field<string>;
}

export interface CustomerDetails {
  id?: string;
  name: string;
  alias: string;
  redirectUrl: string;
  description: string;
  domains: { name: string; verified: boolean }[];
  attributes: {
    products: string[];
    typeOfPipeLine: string[];
    registerNumber: string[];
    gstin: string[];
    agreementDate: string[];
    phoneNumber: string[];
    mailAddress: string[];
    street: string[];
    area: string[];
    landmark?: string[];
    pincode: string[];
    country: string[];
    state: string[];
    district: string[];
  };
}

export interface Domain {
  name: string;
  verified: boolean;
}

export interface Customer {
  alias: string;
  description: string;
  domains: Domain[];
  enabled: boolean;
  id: string;
  name: string;
  redirectUrl: string;
  attributes: Attribute;
}

export interface ZoneFormData {
  zone: Field<string>;
}

export interface CustomerProps {
  viewFlow?: boolean;
  viewData?: Customer | UserData | Zones | UserData[] | Customer[];
  canEdit?: boolean;
  callback?: (status: number, value: string) => void;
  loading?: boolean;
}

export const ProductTypes: Record<string, Option> = {
  in: { label: "Inspection", value: "in", name: "inspection" },
  cl: { label: "Cleaning", value: "cl", name: "cleaning" },
  pm: { label: "PM", value: "pm", name: "pm" },
  ai: { label: "AI", value: "ai", name: "ai" },
} as const;
