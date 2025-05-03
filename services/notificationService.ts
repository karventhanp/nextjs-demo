import { CommentRequest } from "@/types/inpection";
import { ApiResponse } from "@/types/service";
import { apiClient, handleApiError } from "./apiClient";
import { createApiResponse } from "@/helpers/helper";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`;

export const notificationService = {
    createComment: async (inspectionId: string, comment: CommentRequest): Promise<ApiResponse> => {
        try {
            const { data } = await apiClient.post(`/notifications/in/comment/${inspectionId}`, comment);
            return createApiResponse(data.status, data.message, data.data);
        } catch (error) {
            return handleApiError(error, "createComment")
        }
    },
    getAllComments: async (inspectionId: string): Promise<ApiResponse> => {
        try {
            const { data } = await apiClient.get(`/notifications/in/comments/${inspectionId}`);
            return createApiResponse(data.status, data.message, data.data);
        } catch (error) {
            return handleApiError(error, "getAllComments")
        }
    },
    getAllTaggableUsers: async (): Promise<ApiResponse> => {
        try {
            const { data } = await apiClient.get(`/notifications/in/tag`);
            return createApiResponse(data.status, data.message, data.data);
        } catch (error) {
            return handleApiError(error, "getAllTaggableUsers")
        }
    },
    getAllNotifications: async (userId: string): Promise<ApiResponse> => {
        try {
            const { data } = await apiClient.get(`/notifications/notifications/${userId}`);
            return createApiResponse(data.status, data.message, data.data);
        } catch (error) {
            return handleApiError(error, "getAllNotifications");
        }
    },
    getUnReadCounts: async (userId: string): Promise<ApiResponse> => {
        try {
            const { data } = await apiClient.get(`/notifications/in/${userId}/count`);
            return createApiResponse(data.status, data.message, data.data);
        } catch (error) {
            return handleApiError(error, "getUnReadCounts");
        }
    },
    updateComment: async (comment: CommentRequest): Promise<ApiResponse> => {
        try {
            const { data } = await apiClient.put(`/notifications/comment/${comment.id}`, comment);
            return createApiResponse(data.status, data.message, data.data);
        } catch (error) {
            return handleApiError(error, "updateComment")
        }
    },
    markAsRead: async (userId: string, commentId: string | undefined): Promise<ApiResponse> => {
        try {
            if (commentId) {
                // mark as read for specific comment
                const { data } = await apiClient.put(`/notifications/in/${userId}/mark-as-read?commentId=${commentId}`);
                return createApiResponse(data.status, data.message, data.data);
            }
            // mark all as read
            const { data } = await apiClient.put(`/notifications/in/${userId}/mark-as-read`);
            return createApiResponse(data.status, data.message, data.data);
        } catch (error) {
            return handleApiError(error, "markAsRead");
        }
    },
    deleteComment: async (commentId: string): Promise<ApiResponse> => {
        try {
            const { data } = await apiClient.delete(`/notifications/comment/${commentId}`)
            return createApiResponse(data.status, data.message, data.data);
        } catch (error) {
            return handleApiError(error, "deleteComment");
        }
    }
}
