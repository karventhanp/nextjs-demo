export interface FileCategoryData {
  fileName: string;
  fileUrl: string;
  gisId: string;
  gisType: "KMZ" | "KML" | "GIS_IMAGE";
  optForCentralized: boolean;
}

export interface Defects {
  defect: {
    code: string;
    name: string;
    severity: number;
  } | null;
  distance: number;
  id: number;
}

export interface ImageData {
  imgId: string;
  title: string;
  description: string;
  imageUrl: string;
  defects: Defects[];
}

export interface AllImageData {
  defectsImages: ImageData[];
  observationImages: ImageData[];
}

export interface ImageDefectMeta {
  imgId: string;
  title: string;
  description: string;
  distance: string;
  direction: string;
  clock: string;
  timestamp: string;
  imageUrl: string;
  defect: { name: string; code: string; severity: string };
}

export interface VideoData {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  isAIInference: boolean;
  imagesTimestampFields: ImageDefectMeta[];
  inferenceStatus?: "PROCESSING" | "FAILED";
  inferenceMessage?: string;
}

export interface VideosMetaData {
  description: string;
  title: string;
  videoId: string;
}

export interface ImageCardData {
  title: string;
  description: string;
  meta: ImageDefectMeta;
}
