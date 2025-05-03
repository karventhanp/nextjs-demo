import { ApiResponse } from "@/types/service";
import { apiClient, handleApiError } from "./apiClient";
import { createApiResponse, getCustomerId } from "@/helpers/helper";
import { createCustomerIdHeader } from "@/utils/utils";

export const kpiService = {
  getKPI: async (
    timePeriod: string,
    customerId?: string
  ): Promise<ApiResponse> => {
    try {
      const url = customerId
        ? `/in/kpi/${timePeriod}`
        : `/in/kpi/admin/${timePeriod}`;
      const { data } = await apiClient.get(
        url,
        customerId
          ? createCustomerIdHeader(customerId)
          : createCustomerIdHeader("admin")
      );
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getKPI");
    }
  },
};
