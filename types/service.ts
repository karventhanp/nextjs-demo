export interface ApiResponse {
  status: number | null;
  message: string | null;
  data: any;
}

export interface GetCustomers {
  briefRepresentation?: boolean;
  search?: string;
  first?: number;
  max?: number;
}

export interface CentralizedParams {
  last10DaysOnly?: boolean;
}

export interface DownloadReportParams {
  inspectionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface HeaderProps {
  startDate: string;
  endDate: string;
}

export interface FooterProps {
  provider: string;
}

export interface LoadingData {
  inspection: boolean;
  kpi: boolean;
  gis: boolean;
}

export interface UploadProgress {
  uploadId: string;
  fileName: string;
  uploadName: string;
  filePath: string;
  totalBytes: number;
  bytesTransferred: number;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  progressPercentage: number;
  startTime: string;
  lastUpdated: string;
}

export interface ImageMetaPayload {
  title?: string;
  description?: string;
  imageMetadata: {
    distance?: string;
    timestamp?: string;
    direction?: string;
    defectTypeId?: string;
    clock?: string;
  }[];
}

export interface VideoMetaPayload {
  title?: string;
  description?: string;
}

export type AiProcessEvents = "status" | "processing" | "defects" | "oss_id";
