import { ApiResponse } from "@/types/service";
import { apiClient, handleApiError } from "./apiClient";
import { createApiResponse } from "@/helpers/helper";

type FileCategory = "video" | "image" | "gis";

export const assetService = {
  uploadFile: async (
    inspectionId: string,
    fileCategory: FileCategory,
    file: File,
    metaData: object,
    onProgress: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<ApiResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "metadata",
        new Blob([JSON.stringify(metaData)], { type: "application/json" })
      );
      const { data } = await apiClient.post(
        `/in/oss/${inspectionId}/upload?fileCategory=${fileCategory}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percent);
            }
          },
          transformRequest: [(data) => data],
        }
      );
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "uploadFile");
    }
  },
  getStorageUsage: async (): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.get("/oss/in/usage");
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getStorageUsage");
    }
  },
  getImageDefectTypes: async (): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.get("/in/type-fields/img-defect-types");
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getInspection");
    }
  },
  getFilesByCategory: async (
    inspectionId: string,
    fileCategory: "image" | "video" | "gis"
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.get(
        `/in/oss/${inspectionId}/${fileCategory}`
      );
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getFilesByCategory");
    }
  },
  getVideosMetaData: async (inspectionId: string): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.get(`/in/meta/${inspectionId}/videos`);
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "getVideosMetaData");
    }
  },
  deleteFileById: async (
    fileCategory: FileCategory,
    fileId: string
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.delete(
        `/in/meta/${fileCategory}/${fileId}`
      );
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "deleteFileById");
    }
  },
  deleteFilesByCategory: async (
    inspectionId: string,
    fileCategory: FileCategory
  ): Promise<ApiResponse> => {
    try {
      const { data } = await apiClient.delete(
        `/in/${inspectionId}/${fileCategory}`
      );
      return createApiResponse(data.status, data.message, data.data);
    } catch (error) {
      return handleApiError(error, "deleteFilesByCategory");
    }
  },
};
