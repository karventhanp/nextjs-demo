import { ReactNode } from "react";

export interface SkeletonProps {
  type: string;
}

export interface Loading {
  name: string;
  state: boolean;
}

export interface Filter {
  searchBy: string;
  startDate: string;
  endDate: string;
}

export interface PaginationData {
  currentPage: number | undefined;
  pageSize: number | undefined;
  totalPages: number | undefined;
  totalRecords: number | undefined;
}

export interface PaginationProps {
  data: PaginationData | undefined;
  searchByPage: (page: number) => void;
}

export interface ToasterData {
  type: "success" | "error" | "info" | "warning" | null;
  message: string | null;
  path?: string | null | undefined;
  visibility: boolean;
  title?: string;
  background?: string;
}

export type PopupTypes =
  | "single-inspection"
  | "selected-inspections"
  | "image"
  | "search";

export type OffCanvasTypes = "user" | "solinas";

export type HandleClickOutsideProps = {
  ref: React.RefObject<HTMLDivElement>;
  event: MouseEvent;
};

export interface Sort {
  column: "name" | "address" | "date";
  order: "ASC" | "DESC";
}

export type TabSwitcherData = {
  active: number;
  tabs: {
    id: number;
    label: string;
    disabled: boolean;
  }[];
};

export interface TabSwitcherProps {
  data: TabSwitcherData;
  switchTab: (id: number) => void;
  withNormalButton: boolean;
}

export interface FileUploadData {
  imgUrl?: string;
  type?: string;
  multiple: boolean;
  format: { label: string; type: string };
  label?: string;
}

export interface FileUploadProps {
  data: FileUploadData;
  onChange: (file: File[]) => void;
  size: "large" | "medium" | "small" | "logo";
  logo?: string;
}

export interface ProgressData {
  bytesTransferred: number;
  fileName: string;
  filePath: string;
  lastUpdated: string;
  progressPercentage: number;
  startTime: string;
  status: "PREPARING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "FAILED";
  totalBytes: number;
  uploadId: string;
  uploadName: string;
}

export type Actions =
  | "next"
  | "back"
  | "delete"
  | "edit"
  | "download"
  | "select"
  | "close"
  | "click";

export type StepperSteps = {
  step: number;
  label: string;
};

export interface TableHeader {
  name: string;
  sorting?: boolean;
  sortOrder?: "ASC" | "DESC";
  onClick?: (value: string) => void;
  className?: string;
  tag?: boolean;
}

export interface TableContent {
  name: string | string[];
  onClick?: (value: string) => void;
  className?: string;
  icon?: string;
  tagClassName?: string;
}

export interface TableRow {
  id: string;
  contents: TableContent[];
}

export interface TableProps {
  headers: TableHeader[];
  contents: TableRow[];
  removePagination?: boolean;
  loading?: boolean;
  onClick?: (value: string) => void;
}

export const StatusClass: Record<string, string> = {
  ["ACTIVE"]:
    "border border-platinum text-cadmium bg-cadmium/5 p-1 text-xs rounded-md",
  ["INACTIVE"]:
    "border border-platinum text-smokyBlack bg-smokyBlack/5 p-1 text-xs rounded-md",
};

export interface FormRef {
  submitForm?: () => void;
}

export interface NumberTabData {
  active: number;
  tabs: {
    id: number;
    disabled?: boolean;
  }[];
}

export interface NumberTabProps {
  data: NumberTabData;
  switchTab: (id: number) => void;
  createTab: () => void;
  canRemoveTab?: boolean;
  removeTab?: (id: number) => void;
}

export interface ShowDataProps {
  label: string;
  value: string;
}

export interface DataCardProps {
  title: string;
  data: any;
  combineKeys?: string[];
  loading?: boolean;
}

export interface ModalContent {
  title: string;
  content: ReactNode;
  hideHeader?: boolean;
}

export type WidgetLayout = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
};
export interface WidgetData {
  layout: WidgetLayout;
  content: ReactNode;
}

export type VideoPlayerHandle = {
  captureFrame?: () => { image: string; timeStamp: string } | undefined;
  jumpToVideoFrame?: (timeStamp: string) => void;
};

export interface VideoPlayerProps {
  url: string;
  userId: string;
  control: boolean;
  privateUrl: boolean;
  autoPlay?: boolean;
  className?: string;
  seek?: string;
  canDownload?: boolean;
  loadingClassName?: string;
  onTimeUpdate?: (currentTime: string) => void;
}
