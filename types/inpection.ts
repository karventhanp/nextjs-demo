import { Actions } from "./common";
import { Field } from "./input";
import { ImageData } from "./response";

export interface InspectionData {
  id: string;
  inspectedDate: string;
  siteAddress: string;
  siteName: string;
  status: boolean;
}

export interface InspectionDetailsData {
  siteName?: string;
  inspectedDate?: string;
  gpsCoordinates?: { latitude: string; longitude: string };
  address?: {
    street: string;
    area: string;
    landmark: string;
    pincode: number | null;
    district: string;
    state: string;
    country: string;
  };
  zone?: string;
  status?: boolean;
}

export interface InspectionDetailsFormData {
  siteName: Field<string>;
  inspectedDate: Field<string>;
  gpsCoordinates: Field<string>;
  address: {
    street: Field<string>;
    area: Field<string>;
    landmark: Field<string>;
    pincode: Field<string>;
    district: Field<string>;
    state: Field<string>;
    country: Field<string>;
  };
  zone: Field<string>;
}

interface PipelineInformation {
  pipelineType: string;
  material: string;
  diameter: string;
  length: string;
  soilType: string;
  flowRate: string;
  age: string;
  direction: string;
  pipelineIssue: string;
  maintenance: {
    frequency: string;
    times: string;
  };
}

export interface QuestionariesData {
  questionariesData: {
    pipelineInformation: PipelineInformation;
  };
}

export interface QuestionariesFormData {
  pipelineType: Field<string>;
  material: Field<string>;
  diameter: Field<string>;
  length: Field<string>;
  soilType: Field<string>;
  flowRate: Field<string>;
  age: Field<string>;
  direction: Field<string>;
  pipelineIssue: Field<string>;
  maintenance: {
    frequency: Field<string>;
    times: Field<string>;
  };
}

export interface PipelineType {
  name: string;
  properties: {
    diameter: string[];
    materials: string[];
  };
}

export interface FieldOptionsData {
  directions: string[];
  flow_rate: string[];
  maintenance_frequency: string[];
  pipeline_types: PipelineType[];
  soil_types: string[];
}

export interface QuickViewDefect {
  defect: { name: string; code: string; severity: number };
  description: string;
  distance: string;
  imageUrl: string;
  imgId: number;
  title: string;
  position?: number;
  top?: number;
}

export interface QuickViewData {
  address: string;
  area: string;
  date: string;
  direction: string;
  gpsCoordinates: string;
  images: QuickViewDefect[];
  name: string;
  pipelineIssue: string;
  totalLength: string;
}

export interface InspectionPagePropsLegacy {
  viewFlow?: boolean;
  canEdit?: boolean;
  updatePage?: (page: number, skip: boolean) => void;
  viewData?: InspectionDetailsData | QuestionariesData | InSightsData | File[];
  success?: (success: boolean) => void;
  cancel?: () => void;
}

export interface InspectionPageProps {
  createFlow: boolean;
  data?: InspectionDetailsData | QuestionariesData | InSightsData;
  updatePage?: (page: number, skip: boolean) => void;
  success?: () => void;
}

export type VideoQueueData = {
  uploadId: string;
  userId: string;
  name: string;
  size: number;
  percent: number;
  thumbnailUrl: string;
};

export interface ImageFormMetaData {
  distance: Field<string>;
  timestamp: Field<string>;
  direction: Field<string>;
  defectTypeId: Field<string>;
  severity: Field<string>;
}

export interface ObservationFormImageData {
  title: Field<string>;
  description: Field<string>;
  videoId: Field<string>;
  imageMetaData: ImageFormMetaData[];
}

export interface LegacyImageMetaData {
  distance: string;
  timestamp: string;
  direction: string;
  defectTypeId?: string;
  videoId?: string;
}

export interface LegacyObservationImageData {
  file: File;
  title: string;
  description: string;
  imageMetadata: LegacyImageMetaData[];
}

export interface DefectFieldTypes {
  name: string;
  code: string;
  severity: string;
  id: string;
}

export interface InSightsFormData {
  rating: Field<string>;
  category: Field<string>;
  description: Field<string>;
  recommendations: {
    recommendation: Field<string>;
  }[];
}

export interface InSightFieldOption {
  risk: {
    categories: Record<string, string[]>;
    rating: string[];
  };
}

export interface InSightsData {
  insightsData: {
    riskAssessment: {
      rating: string;
      category: string;
      description: string;
    };
    recommendations: {
      id: number;
      description: string;
    }[];
  };
}

export interface Risk {
  rating: string[];
  category: string[];
}

export type IconBoxActions = {
  id: string;
  action: Actions;
  loading: boolean;
};

export interface ImageCardProps {
  data: ImageData;
  actions: IconBoxActions[];
  onClick: (type: Actions, imgId: string) => void;
}

export type ActionDropDown = {
  action: Actions;
  image: string;
  label: string;
};

export type Zones = string[];
export interface Process {
  active: boolean;
  percent: number;
}

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  read: boolean;
  parentId: string | null;
  replyCount: number;
  replies: Comment[];
  recipientIds?: string[];
  createdBy?: string;
}

export interface CommentRequest {
  id?: string,
  content: string,
  recipientIds?: string[],
  parentId?: string | null,
  identifierId?: string,
}

export interface TaggableUsers {
  id: string;
  username: string;
  displayName: string
  email: string;
}

export interface ImageMetaData {
  videoId: string;
  distance: string;
  timestamp: string;
  direction: string;
  clock: string;
  defectTypeId?: string;
}

export interface DefectImageData {
  title: string;
  description: string;
  imageMetadata: ImageMetaData[];
  file?: File;
}

export interface DefectFormData {
  title: Field<string>;
  description: Field<string>;
  timeStamp: Field<string>;
  distance: Field<string>;
  defect: Field<string>;
  direction: Field<string>;
  severity: Field<string>;
  clockStart: Field<string>;
  clockEnd: Field<string>;
}

export interface  CreateDefectProps {
  videoId: string;
  data: { image: string; timeStamp: string } | null;
  success?: () => void;
}

export interface ObservationFormData {
  title: Field<string>;
  description: Field<string>;
  timeStamp: Field<string>;
  distance: Field<string>;
  direction: Field<string>;
  clockStart: Field<string>;
  clockEnd: Field<string>;
}
export interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  relativeTime?: string;
  read: boolean;
  parentId: string | null;
  replyCount: number;
  replies: Comment[];
  recipientIds?: string[];
  createdBy?: string;
}

export interface CommentRequest {
  id?: string,
  content: string,
  recipientIds?: string[],
  parentId?: string | null,
  identifierId?: string,
}

export interface TaggableUsers {
  id: string;
  username: string;
  displayName: string
  email: string;
}

export interface VideosWidgetRef {
  jumtoVideoFrame?: (timeStamp: string) => void;
}
