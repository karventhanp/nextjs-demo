import {
  ApiResponse,
  DownloadReportParams,
  ImageMetaPayload,
  VideoMetaPayload,
} from "@/types/service";
import { apiClient, handleApiError } from "./apiClient";
import {
  InspectionDetailsData,
  QuestionariesData,
  InSightsData,
  Zones,
} from "@/types/inpection";
import { createApiResponse } from "@/helpers/helper";
import { CentralizedParams } from "@/types/service";
import { createCustomerIdHeader } from "@/utils/utils";

export const inspectionService = {
  createInspection: async (
    details: InspectionDetailsData
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.post("/in/", details);
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "createInspection");
    }
  },
  createZone: async (
    zones: Zones,
    customerId: string | undefined
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.post(
        "/in/zones",
        zones,
        createCustomerIdHeader(customerId)
      );
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "createZone");
    }
  },
  createCentralizedGis: async (): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post("/in/gis/centralized/consolidate");
      return createApiResponse(
        response.status,
        response.data.message,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "createCentralizedGis");
    }
  },
  triggerAiAnalyse: async (videoId: string): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.post(`/in/inference/${videoId}`);
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "triggerAiAnalyse");
    }
  },
  getInspection: async (filterItems?: string): Promise<ApiResponse> => {
    try {
      const url =
        filterItems && filterItems.length > 0 ? "/in/?" + filterItems : "/in/";
      const { data } = await apiClient.get(url);
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getInspection");
    }
  },
  getFieldOptions: async (): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.get("/in/type-fields/inspection-fields");
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getFieldOptions");
    }
  },
  getQuickInspection: async (inspectionId: string): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.get(`/in/${inspectionId}/quick-view`);
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getQuickInspection");
    }
  },
  getInspectionById: async (inspectionId: string): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.get(`/in/${inspectionId}`);
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getInspectionById");
    }
  },
  getZones: async (customerId: string | undefined): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.get(
        "/in/zones",
        createCustomerIdHeader(customerId)
      );
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getZones");
    }
  },
  getCentralizedGis: async (
    params?: CentralizedParams
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.get("/in/gis/centralized", { params });
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getcentralizedGis");
    }
  },
  downloadReport: async ({
    inspectionId,
    startDate,
    endDate,
  }: DownloadReportParams): Promise<ApiResponse> => {
    try {
      const params: any = {};
      if (inspectionId) {
        params.inspectionId = inspectionId;
      } else if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else {
        throw new Error(
          "Either inspectionId or startDate and endDate must be provided."
        );
      }
      const response = await apiClient.get("/in/report/pdf", { params });
      return createApiResponse(
        response.status,
        response.data.message,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "downloadReport");
    }
  },
  updateInspection: async (
    inspectionId: string,
    details: QuestionariesData | InspectionDetailsData | InSightsData
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.put(`/in/${inspectionId}`, details);
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "updateInspection");
    }
  },
  updateZone: async (
    zones: Zones,
    customerId: string | undefined
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.put(
        "/in/zones",
        zones,
        createCustomerIdHeader(customerId)
      );
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "updateZone");
    }
  },
  updateImageMeta: async (
    imageId: string,
    imageMeta: ImageMetaPayload
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.put(
        `/in/meta/image/${imageId}`,
        imageMeta
      );
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "updateImageMeta");
    }
  },
  updateVideoMeta: async (
    videoId: string,
    videoMeta: VideoMetaPayload
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.put(
        `/in/meta/video/${videoId}`,
        videoMeta
      );
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "updateVideoMeta");
    }
  },
  addToCentralizedGis: async (
    gisId: string,
    optForCentralized: boolean
  ): Promise<ApiResponse> => {
    try {
      const response = await apiClient.put(`/in/meta/gis/${gisId}`, {
        optForCentralized,
      });
      return createApiResponse(
        response.status,
        response.data.message,
        response.data
      );
    } catch (error) {
      return handleApiError(error, "addToCentralizedGis");
    }
  },
  deleteInspection: async (inspectionId: string): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.delete(`/in/${inspectionId}`);
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "deleteInspection");
    }
  },
  deleteZone: async (
    zones: Zones,
    customerId: string | undefined
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.delete("/in/zones", {
        data: zones,
        ...createCustomerIdHeader(customerId),
      });
      return createApiResponse(data.status, data.message, "");
    } catch (error) {
      return handleApiError(error, "deleteZone");
    }
  },
  deleteImage: async (imageId: string): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.delete(`/in/meta/image/${imageId}`);
      return createApiResponse(data.status, data.message, "");
    } catch (error) {
      return handleApiError(error, "deleteImage");
    }
  },
};
