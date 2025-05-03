import { ApiResponse, GetCustomers } from "@/types/service";
import { authClient } from "./apiClient";
import { createApiResponse } from "@/helpers/helper";
import { handleApiError } from "./apiClient";
import { CustomerDetails } from "@/types/customer";
import { UserPayload, UserUpdatePayload } from "@/types/user";
import { UserRolePayload } from "@/types/roles";

const getResponseId = (url: string) => {
  const splittedUrl = url.split("/");
  return splittedUrl[splittedUrl.length - 1];
};

const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

export const authService = {
  createCustomer: async (formData: CustomerDetails): Promise<ApiResponse> => {
    try {
      const response = await authClient.post("organizations", formData);
      return createApiResponse(
        response.status,
        response.statusText,
        getResponseId(response.headers.location)
      );
    } catch (error) {
      return handleApiError(error, "createCustomer");
    }
  },
  createUser: async (formData: UserPayload): Promise<ApiResponse> => {
    try {
      const response = await authClient.post("/onboarding/add-user", formData);
      return createApiResponse(response.status, response.statusText, "");
    } catch (error) {
      return handleApiError(error, "createUser");
    }
  },
  addRoleToUser: async (
    userId: string,
    role: UserRolePayload
  ): Promise<ApiResponse> => {
    try {
      const response = await authClient.post(
        `/users/${userId}/role-mappings/clients/${clientId}`,
        [role]
      );
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "addRoleToUser");
    }
  },
  uploadCustomerLogo: async (
    customerId: string,
    logo: File
  ): Promise<ApiResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", logo);
      const response = await authClient.post(
        `/onboarding/${customerId}/logo`,
        formData,
        { transformRequest: [(data) => data] }
      );
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "uploadCustomerLogo");
    }
  },
  getCustomerById: async (customerId: string): Promise<ApiResponse> => {
    try {
      const response = await authClient.get(`/organizations/${customerId}`);
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "getCustomerById");
    }
  },
  getCustomers: async ({
    search,
    first,
    max,
  }: GetCustomers): Promise<ApiResponse> => {
    try {
      const params = new URLSearchParams();
      params.append("BriefRepresentation", "true");
      if (search) params.append("search", search);
      if (first !== undefined) params.append("first", first.toString());
      if (max !== undefined) params.append("max", max.toString());
      const url = `/organizations?${params.toString()}`;
      const response = await authClient.get(url);
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "getCustomers");
    }
  },
  getCustomerLogo: async (customerId: string): Promise<ApiResponse> => {
    try {
      const response = await authClient.get(`/meta/${customerId}/logo`, {
        responseType: "blob",
      });
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "getCustomerLogo");
    }
  },
  getUserById: async (userId: string): Promise<ApiResponse> => {
    try {
      const response = await authClient.get(`/users/${userId}`);
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "getUserById");
    }
  },
  getUsersByCustomer: async (customerId: string): Promise<ApiResponse> => {
    try {
      const response = await authClient.get(
        `/organizations/${customerId}/members`
      );
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "getUsersByCustomer");
    }
  },
  getUserRoles: async (userId: string): Promise<ApiResponse> => {
    try {
      const response = await authClient.get(
        `/users/${userId}/role-mappings/clients/${clientId}`
      );
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "getUserRoles");
    }
  },
  getAllUserRoles: async (userId: string): Promise<ApiResponse> => {
    try {
      const response = await authClient.get(
        `/users/${userId}/role-mappings/clients/${clientId}/available`
      );
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "getAllUserRoles");
    }
  },
  getClientRoles: async (): Promise<ApiResponse> => {
    try {
      const response = await authClient.get(`/clients/${clientId}/roles`);
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "getClientRoles");
    }
  },
  getFsaUsers: async (): Promise<ApiResponse> => {
    try {
      const response = await authClient.get(`/meta/users/fsa`);
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "getFsaUsers");
    }
  },
  updateUser: async (
    userId: string,
    userData: UserUpdatePayload
  ): Promise<ApiResponse> => {
    try {
      const response = await authClient.put(`/users/${userId}`, userData);
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "updateUser");
    }
  },
  updateCustomer: async (
    customerId: string,
    formData: CustomerDetails
  ): Promise<ApiResponse> => {
    try {
      const response = await authClient.put(
        `/organizations/${customerId}`,
        formData
      );
      return createApiResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "updateCustomer");
    }
  },
  removeUserRole: async (
    userId: string,
    role: UserRolePayload
  ): Promise<ApiResponse> => {
    try {
      const response = await authClient.delete(
        `/users/${userId}/role-mappings/clients/${clientId}`,
        { data: [role] }
      );
      return createApiResponse(response.status, response.statusText, response.data);
    } catch (error) {
      return handleApiError(error, "removeUserRole");
    }
  },
  deleteUser: async (userId: string): Promise<ApiResponse> => {
    try {
      const response = await authClient.delete(`/users/${userId}`);
      return createApiResponse(response.status, response.statusText, response.data);
    } catch (error) {
      return handleApiError(error, "deleteUser");
    }
  }
};
