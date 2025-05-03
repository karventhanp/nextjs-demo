import { NotificationResponse } from "@/types/notification";
import { AiProcessEvents, UploadProgress } from "@/types/service";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const sseService = {
  getUploadProgress: (
    uploadId: string,
    onUpdate: (data: UploadProgress) => void
  ) => {
    const url = `${BASE_URL}/oss/sse/${uploadId}/progress`;
    const source = new EventSource(url);

    source.addEventListener("uploadProgress", (event: MessageEvent) => {
      try {
        const data: UploadProgress = JSON.parse(event.data);
        onUpdate(data);
        if (data.status === "COMPLETED") {
          source.close();
        }
      } catch (error) {
        console.error("Error parsing progress JSON", error);
      }
    });

    source.onerror = (error) => {
      console.warn("SSE error", error);
      source.close();
    };
  },
  // to notify the user about comment mentions
  getNotifications: (
    customerId: string,
    onUpdate: (data: NotificationResponse) => void
  ) => {
    const url = `${BASE_URL}/notifications/sse/${customerId}`;
    const source = new EventSource(url);

    source.addEventListener("UNREAD_COUNT", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate({
          unreadCount: data.unreadCount,
          timestamp: data.timestamp,
        });
      } catch (error) {
        console.error("Error parsing un read count JSON", error);
      }
    });
    source.addEventListener("NOTIFICATION", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate({
          notification: data.notification,
          unreadCount: data.unreadCount,
          timestamp: data.timestamp,
        });
      } catch (error) {
        console.error("Error parsing notifications JSON", error);
      }
    });

    source.onerror = (error) => {
      console.warn("SSE error", error);
      source.close();
    };
  },
  getAIProgress: (
    videoId: string,
    onUpdate: (event: AiProcessEvents, data: string) => void
  ) => {
    const baseUrl = BASE_URL?.replace(/\/api$/, "");
    const url = `${baseUrl}/ai/sse/${videoId}/progress`;
    const source = new EventSource(url);

    source.addEventListener("status", (event: MessageEvent) => {
      try {
        const data = event.data;
        onUpdate("status", data);
      } catch (error) {
        console.error("Error AI status processing", error);
      }
    });

    source.addEventListener("processing", (event: MessageEvent) => {
      try {
        const data = event.data;
        onUpdate("processing", data);
      } catch (error) {
        console.error("Error AI processing", error);
      }
    });

    source.addEventListener("defects", (event: MessageEvent) => {
      try {
        const data = event.data;
        onUpdate("defects", data);
      } catch (error) {
        console.error("Error AI Defects processing", error);
      }
    });

    source.addEventListener("oss_id", (event: MessageEvent) => {
      try {
        const data = event.data;
        onUpdate("oss_id", data);
      } catch (error) {
        console.error("Error AI OSS ID processing", error);
      }
    });

    source.onerror = (error) => {
      console.warn("SSE error", error);
      source.close();
    };
  },
};
