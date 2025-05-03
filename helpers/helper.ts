import { AllowedActions, UserRole } from "@/types/roles";
import { signOut } from "next-auth/react";
import axios from "axios";
import { ApiResponse, ImageMetaPayload, UploadProgress } from "@/types/service";
import {
  InspectionDetailsFormData,
  InspectionDetailsData,
  QuestionariesFormData,
  QuestionariesData,
  ObservationFormImageData,
  LegacyObservationImageData,
  DefectFieldTypes,
  InSightsData,
  InSightsFormData,
  QuickViewDefect,
  IconBoxActions,
  VideoQueueData,
  DefectFormData,
  LegacyImageMetaData,
  DefectImageData,
  ObservationFormData,
} from "@/types/inpection";
import {
  base64ToFileOrBlob,
  extractNumber,
  formatFileName,
  getLocalStorage,
  imageToBlob,
  removeLocalStorage,
  setLocalStorage,
} from "@/utils/utils";
import {
  StepperButtons,
  StepperButtonData,
  ActionButtonData,
  ActionButtons,
} from "@/types/button";
import { Field } from "@/types/input";
import { VideosMetaData } from "@/types/response";
import { Actions, NumberTabData, ShowDataProps } from "@/types/common";
import { AssignedCustomers, OrganizationInfo } from "@/types/auth";
import { MenuItem } from "@/types/menu";
import {
  CompanyPocFormData,
  Customer,
  CustomerDetails,
  CustomerDetailsFormData,
} from "@/types/customer";
import {
  UserPayload,
  UserFormData,
  UserUpdatePayload,
  UserData,
  SolinasUserFormData,
} from "@/types/user";
import Constants from "@/constants/constants";

export const getRoles = (
  token: string | undefined,
  clientId: string | undefined
): UserRole[] => {
  if (!token || !clientId) {
    return [];
  }
  const decoded = decodeToken(token);
  const client = decoded.resource_access[clientId];
  if (client) {
    const roles =
      client.roles
        .filter((role: string) =>
          Object.values(UserRole).includes(role as UserRole)
        )
        .map((role: string) => role as UserRole) || [];
    return roles;
  }
  return [];
};

export const decodeToken = (token: string) => {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

export const getAssignedCustomers = (
  token: string | undefined
): AssignedCustomers[] | null => {
  if (!token) {
    return null;
  }
  const decoded = decodeToken(token);
  const customer_ids = decoded.assgined_customers;
  if (!Array.isArray(customer_ids) || customer_ids.length === 0) {
    return null;
  }
  return customer_ids;
};

export const getOrganization = (
  token: string | undefined
): OrganizationInfo | null => {
  if (!token) {
    return null;
  }
  const decoded = decodeToken(token);
  const name = Object.keys(decoded.organization)[0];
  const id = decoded.organization[name].id;
  const organizationInfo: OrganizationInfo = {
    id,
    name,
    customer_view: name !== "solinas",
  };
  return organizationInfo;
};

export const getAllowedActions = (
  assignedRoles: UserRole[] | undefined,
  customerView: boolean
): AllowedActions => {
  const permissions: AllowedActions = {
    view: false,
    edit: false,
    create: false,
    delete: false,
    download: false,
    fsa_management: false,
    user_management: false,
  };
  if (!assignedRoles) {
    return permissions;
  }
  if (assignedRoles.includes(UserRole.SUPER_ADMIN)) {
    permissions.view = true;
    permissions.edit = true;
    permissions.create = true;
    permissions.delete = true;
    permissions.download = true;
    if (!customerView) {
      permissions.fsa_management = true;
      permissions.user_management = true;
    }
  }
  if (assignedRoles.includes(UserRole.ADMIN)) {
    permissions.view = true;
    permissions.edit = true;
    permissions.create = true;
    permissions.delete = true;
    permissions.download = true;
    if (customerView) permissions.user_management = true;
    else permissions.fsa_management = true;
  }
  if (assignedRoles.includes(UserRole.FSA)) {
    permissions.view = true;
    permissions.edit = true;
    permissions.download = true;
  }
  if (assignedRoles.includes(UserRole.VIEWER)) {
    permissions.view = true;
  }
  return permissions;
};

export const logout = async (idToken: string | undefined): Promise<boolean> => {
  if (!idToken) return false;
  const keycloakResponse = await axios.get(
    `/api/auth/logout?id_token_hint=${idToken}`
  );
  await signOut();
  if (keycloakResponse?.status !== 200) return false;

  return true;
};

export const createApiResponse = (
  status: number,
  message: string,
  data: any
): ApiResponse => {
  return { status, message, data };
};

export const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Unknown Error";
};

export const getAddress = async (pincode: string) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode},IN&key=${apiKey}`;
  const details: {
    country: string | null;
    state: string | null;
    district: string | null;
  } = {
    country: null,
    state: null,
    district: null,
  };
  try {
    const response = await axios.get(url);
    if (response.status === 200 && response.data.status !== "ZERO_RESULTS") {
      const addressList = response.data.results[0].address_components;
      addressList.forEach((address: any) => {
        if (address.types.includes("administrative_area_level_3")) {
          details.district = address.long_name;
        } else if (address.types.includes("locality")) {
          details.district = address.long_name;
        }
        if (address.types.includes("administrative_area_level_1")) {
          details.state = address.long_name;
        }
        if (address.types.includes("country")) {
          details.country = address.long_name;
        }
      });
    }
  } catch (error) {
    console.error("Error while fetching address:: ", error);
  }
  return details;
};

export const groupDataByTimePeriod = (
  barChart: Record<string, number>,
  timePeriodKey: string
) => {
  const groupedData: Record<string, number> = {};

  const currentDate = new Date();
  const getMonthShortName = (date: Date) =>
    date.toLocaleString("default", { month: "short" });

  Object.entries(barChart).forEach(([date, value]) => {
    const entryDate = new Date(date);
    let key: string;

    if (timePeriodKey === "1months") {
      const weekNumber = Math.ceil(entryDate.getDate() / 7);
      key = `Week ${weekNumber}`;
    } else if (timePeriodKey === "3months" || timePeriodKey === "6months") {
      const monthsAgo = timePeriodKey === "3months" ? 3 : 6;
      const startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - monthsAgo);
      if (entryDate >= startDate) {
        key = getMonthShortName(entryDate);
      } else {
        return;
      }
    } else if (timePeriodKey === "1years") {
      key = getMonthShortName(entryDate);
    } else {
      const day = entryDate.getDate();
      const month = entryDate.getMonth() + 1;
      key = `${day}/${month}`;
    }
    if (!groupedData[key]) {
      groupedData[key] = 0;
    }
    groupedData[key] += Number(value);
  });
  return groupedData;
};

export const getValidCoords = (value: string) => {
  const coords = value.split(",");
  return { latitude: coords[0], longitude: coords[1] };
};

export const areAllKeyValuesMatched = <T extends Record<string, any>>(
  obj: T,
  key: string,
  value: any
): boolean => {
  const checkKeyValue = (data: any): boolean => {
    if (typeof data !== "object" || data === null) return false;

    for (const itemKey in data) {
      const item = data[itemKey];

      if (typeof item === "object" && item !== null) {
        if (key in item && item[key] !== value) {
          return false;
        }
        if (!checkKeyValue(item)) {
          return false;
        }
      }
    }
    return true;
  };

  return checkKeyValue(obj);
};

export const areAllRequiredFieldsFilled = (
  obj: any,
  excludedKeys?: string[]
): boolean => {
  const checkFields = (data: any): boolean => {
    if (typeof data !== "object" || data === null) return true;

    for (const key in data) {
      if (excludedKeys && excludedKeys.includes(key)) continue;

      const item = data[key];

      if (typeof item === "object" && item !== null) {
        if ("required" in item && item.required) {
          if (!item.value || item.value.toString().trim() === "") {
            return false;
          }
        }

        if (!checkFields(item)) {
          return false;
        }
      }
    }
    return true;
  };

  return checkFields(obj);
};

export const extractInspectionDetailsData = (
  details: InspectionDetailsFormData
): InspectionDetailsData => {
  const formatValue = (item: any) =>
    typeof item === "object" && item !== null && "value" in item
      ? item.value
      : item;

  const formattedData: InspectionDetailsData = {
    siteName: "",
    inspectedDate: "",
    gpsCoordinates: { latitude: "", longitude: "" },
    address: {
      street: "",
      area: "",
      landmark: "",
      pincode: null,
      district: "",
      state: "",
      country: "",
    },
    zone: "",
  };

  Object.keys(details).forEach((key) => {
    const field = details[key as keyof InspectionDetailsFormData];

    if (typeof field === "object" && field !== null) {
      if (
        key === "inspectedDate" &&
        "value" in field &&
        typeof field.value === "string"
      ) {
        formattedData.inspectedDate = new Date(field.value).toLocaleDateString(
          "en-GB"
        );
      } else if (
        key === "gpsCoordinates" &&
        "value" in field &&
        typeof field.value === "string"
      ) {
        const [latitude, longitude] = field.value.split(",");
        formattedData.gpsCoordinates = {
          latitude: latitude?.trim() || "",
          longitude: longitude?.trim() || "",
        };
      } else if (key === "address" && typeof field === "object") {
        formattedData.address = Object.fromEntries(
          Object.entries(field).map(([subKey, subValue]) => [
            subKey,
            formatValue(subValue),
          ])
        ) as InspectionDetailsData["address"];
      } else if (key === "zone" && typeof field === "string") {
        formattedData.zone = formatValue(field);
      } else {
        formattedData[key as keyof InspectionDetailsData] = formatValue(field);
      }
    }
  });

  return formattedData;
};

export const extractInspectionQuestionariesData = (
  details: QuestionariesFormData,
  unit: string
) => {
  const formatValue = (item: any) =>
    typeof item === "object" && item !== null && "value" in item
      ? item.value
      : item;

  const formattedData: QuestionariesData = {
    questionariesData: {
      pipelineInformation: {
        age: "",
        diameter: "",
        direction: "",
        flowRate: "",
        length: "",
        maintenance: {
          frequency: "",
          times: "",
        },
        material: "",
        pipelineIssue: "",
        pipelineType: "",
        soilType: "",
      },
    },
  };

  Object.keys(details).forEach((key) => {
    const field = details[key as keyof QuestionariesFormData];

    if (typeof field === "object" && field !== null) {
      if (key === "maintenance" && typeof field === "object") {
        formattedData.questionariesData.pipelineInformation.maintenance =
          Object.fromEntries(
            Object.entries(field).map(([subKey, subValue]) => [
              subKey,
              formatValue(subValue),
            ])
          ) as QuestionariesData["questionariesData"]["pipelineInformation"]["maintenance"];
      } else if (
        key === "length" &&
        "value" in field &&
        typeof "value" === "string"
      ) {
        const finalUnit = unit.toLowerCase().includes("km") ? "km" : "m";
        formattedData.questionariesData.pipelineInformation.length =
          field.value + finalUnit;
      } else {
        formattedData.questionariesData.pipelineInformation[
          key as keyof QuestionariesData["questionariesData"]["pipelineInformation"]
        ] = formatValue(field);
      }
    }
  });

  return formattedData;
};

export const getValidUrl = (signedUrl: string, userId: string) => {
  if (signedUrl && userId) {
    return signedUrl + "&X-SWASTH-RESOURCE-USER=" + userId;
  }
  return "";
};

export const calculateDefectPosition = (
  totalLength: string,
  defects: QuickViewDefect[]
): QuickViewDefect[] => {
  const total = extractNumber(totalLength);
  if (!total || isNaN(total)) return defects;

  const distanceCount = new Map<number, number>();

  defects.forEach((defect) => {
    const defectDistance = extractNumber(defect.distance);
    distanceCount.set(
      defectDistance,
      (distanceCount.get(defectDistance) || 0) + 1
    );
  });

  const positionTrack = new Map<number, number>();

  return defects.map((defect) => {
    const defectDistance = extractNumber(defect.distance);
    const position = (defectDistance / total) * 100;

    const occurrence = distanceCount.get(defectDistance) || 0;

    let top = 50;

    if (occurrence > 1) {
      const currentIndex = positionTrack.get(defectDistance) || 0;

      const direction = currentIndex % 2 === 0 ? -1 : 1;
      top = 50 + direction * Math.ceil(currentIndex / 2) * 10;

      positionTrack.set(defectDistance, currentIndex + 1);
    }

    return {
      ...defect,
      position: Math.min(position, 100),
      top,
    };
  });
};

export const updateStepperButtons = (
  buttons: StepperButtons,
  updates: { key: keyof StepperButtons; values: Partial<StepperButtonData> }[]
): StepperButtons => {
  const updatedButtons = { ...buttons };

  updates.forEach(({ key, values }) => {
    if (updatedButtons[key]) {
      updatedButtons[key] = { ...updatedButtons[key], ...values };
    }
  });

  return updatedButtons;
};

export const extractFormData = (
  form: Record<string, Field<any>>
): Record<string, any> => {
  return Object.keys(form).reduce((acc, key) => {
    acc[key] = form[key].value;
    return acc;
  }, {} as Record<string, any>);
};

export const extractInspectionObservationImageData = (
  form: { file: File | null; data: ObservationFormImageData }[],
  selectedUnits: { image: number; meta: { unit: string; index: number }[] }[],
  defectFieldTypes: DefectFieldTypes[],
  videos: VideosMetaData[],
  toggleForm: { image: number; form: { active: number } }[]
): LegacyObservationImageData[] => {
  const formatValue = (item: Field<string> | undefined) => item?.value ?? "";

  const includeVideoId = videos.length > 0;

  return form.map((item, imageIndex) => {
    const active = toggleForm.find((toggle) => toggle.image === imageIndex)
      ?.form.active;

    return {
      file: item.file as File,
      title: formatValue(item.data.title),
      description: formatValue(item.data.description),
      imageMetadata: item.data.imageMetaData.map((meta, index) => {
        const unitEntry = selectedUnits
          .find((unit) => unit.image === imageIndex)
          ?.meta.find((metaUnit) => metaUnit.index === index);

        const unit = unitEntry
          ? unitEntry.unit.toLowerCase().includes("km")
            ? "km"
            : "m"
          : "m";

        const metaData: Partial<LegacyImageMetaData> = {
          distance: `${formatValue(meta.distance)}${unit}`,
          timestamp: formatValue(meta.timestamp),
          direction: formatValue(meta.direction),
        };

        if (active !== 2) {
          const defectTypeId = defectFieldTypes.find(
            (defect) => defect.name === formatValue(meta.defectTypeId)
          )?.id;
          if (defectTypeId) {
            metaData.defectTypeId = defectTypeId;
          }
        }

        if (includeVideoId) {
          const videoId = videos.find(
            (video) => video.title === formatValue(item.data.videoId)
          )?.videoId;
          if (videoId) {
            metaData.videoId = videoId;
          }
        }

        return metaData as LegacyImageMetaData;
      }),
    };
  });
};

export const areAllRequiredFieldsFilledForObservationImage = (
  obj: any,
  skipKeys: Record<number, string[]> = {},
  imageIndex: number = -1
): boolean => {
  const checkFields = (data: any): boolean => {
    if (typeof data !== "object" || data === null) return true;

    for (const key in data) {
      const item = data[key];

      if (imageIndex !== -1 && skipKeys[imageIndex]?.includes(key)) {
        continue;
      }

      if (typeof item === "object" && item !== null) {
        if (
          item.required &&
          (!item.value || item.value.toString().trim() === "")
        ) {
          return false;
        }
        if (!checkFields(item)) return false;
      }
    }
    return true;
  };

  return checkFields(obj);
};

export const extractInspectionInsightsData = (
  details: InSightsFormData
): InSightsData => {
  const formattedData: InSightsData = {
    insightsData: {
      riskAssessment: {
        rating: details.rating.value ?? "",
        category: details.category.value ?? "",
        description: details.description.value ?? "",
      },
      recommendations: details.recommendations.map((rec, index) => ({
        id: index,
        description: rec.recommendation.value?.replace(/\n/g, "") ?? "",
      })),
    },
  };

  return formattedData;
};

export const checkAllVideosCompleted = (videos: VideoQueueData[]) => {
  const completedCount = videos.filter((video) => video.percent === 100);
  if (videos.length === completedCount.length) {
    return true;
  } else {
    return false;
  }
};

export const processInspectionDataKeyandValue = <T extends Record<string, any>>(
  obj: T,
  callback: (key: string, value: any) => void
) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      if (key === "gpsCoordinates") {
        const singleValue = value.latitude + "," + value.longitude;
        callback(key, String(singleValue));
      } else {
        processInspectionDataKeyandValue(value, callback);
      }
    } else {
      if (key === "recommendations") {
        callback(key, value);
      } else {
        callback(key, String(value));
      }
    }
  });
};

export const updateActionButton = (
  actions: ActionButtons,
  updates: { key: keyof ActionButtons; values: Partial<ActionButtonData> }[]
): ActionButtons => {
  const updatedActions = { ...actions };

  updates.forEach(({ key, values }) => {
    if (updatedActions[key]) {
      updatedActions[key] = { ...updatedActions[key], ...values };
    }
  });

  return updatedActions;
};

export const updateAction = (
  prev: IconBoxActions[],
  id: string,
  action: Actions,
  loading: boolean
): IconBoxActions[] => {
  const existingIndex = prev.findIndex(
    (item) => item.id === id && item.action === action
  );

  if (existingIndex !== -1) {
    return prev.map((item, index) =>
      index === existingIndex ? { ...item, loading } : item
    );
  }

  return [...prev, { id, action, loading }];
};

export const getCustomerMenus = (): MenuItem[] => [
  {
    name: "Dashboard",
    active: true,
    iconActivePath: "dashboard-icon-active.svg",
    iconPath: "dashboard-icon.svg",
    path: "/",
    subPaths: ["user/settings", "customer-settings"],
  },
  {
    name: "Manage Inspection",
    active: false,
    iconActivePath: "inspection-icon-active.svg",
    iconPath: "inspection-icon.svg",
    path: "/inspections",
    subPaths: ["/create"],
  },
  {
    name: "Centralized Map",
    active: false,
    iconActivePath: "gis-icon-active.svg",
    iconPath: "gis-icon.svg",
    path: "/centralized-map",
  },
];

export const getAdminMenus = (): MenuItem[] => [
  {
    name: "Dashboard",
    active: true,
    iconActivePath: "dashboard-icon-active.svg",
    iconPath: "dashboard-icon.svg",
    path: "/",
    subPaths: ["user/settings", "customer-settings"],
  },
  {
    name: "Customer Management",
    active: false,
    iconActivePath: "building-active.svg",
    iconPath: "building.svg",
    path: "/customers",
    subPaths: ["/create"],
    activePaths: ["/inspections"],
  },
  {
    name: "FSA Management",
    active: false,
    iconActivePath: "user-group-active.svg",
    iconPath: "user-group.svg",
    path: "/users",
  },
];

export const validInspectionPath = (path: string): boolean => {
  return /^\/inspections\/\d{18}$/.test(path);
};

export const checkUserHasAccess = (
  organization: OrganizationInfo,
  allowedActions: AllowedActions,
  currentPath: string,
  role: UserRole | undefined
): boolean => {
  if (role) {
    const customerMenus = getCustomerMenus();
    const adminMenus = getAdminMenus();
    const allAllowedPaths = customerMenus
      .concat(adminMenus)
      .flatMap((menu) => [
        menu.path,
        ...(menu.subPaths?.map((sub) => menu.path + sub) || []),
      ]);
    if (
      allAllowedPaths.includes(currentPath) ||
      validInspectionPath(currentPath)
    ) {
      if (organization.customer_view) {
        const restrictedPaths = allowedActions.create
          ? []
          : ["/inspections/create"];
        const allowedPaths = customerMenus.flatMap((menu) => [
          menu.path,
          ...(menu.subPaths?.map((subPath) => menu.path + subPath) || []),
        ]);

        return (
          (allowedPaths.includes(currentPath) ||
            validInspectionPath(currentPath)) &&
          !restrictedPaths.includes(currentPath)
        );
      }
    }
    return true;
  }
  return false;
};

export const isValidLogo = (logo: File): Promise<boolean> => {
  const MAX_SIZE = 1 * 1024 * 1024; // 1MB
  const REQUIRED_WIDTH = 640;
  const REQUIRED_HEIGHT = 640;

  if (logo.size > MAX_SIZE) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(logo);

    img.onload = () => {
      const isValid =
        img.width <= REQUIRED_WIDTH && img.height <= REQUIRED_HEIGHT;
      URL.revokeObjectURL(objectUrl);
      resolve(isValid);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(false);
    };

    img.src = objectUrl;
  });
};

export const sanitizeCustomerName = (name: string) => {
  return name.split(" ").join("_").toLowerCase();
};

export const extractCustomerDetails = async (
  data: CustomerDetailsFormData,
  products: string[],
  customerId?: string,
  alias?: string
): Promise<CustomerDetails> => {
  const formData: CustomerDetails = {
    name: sanitizeCustomerName(data.name.value ?? ""),
    alias: alias ? alias : sanitizeCustomerName(data.name.value ?? ""),
    redirectUrl: `${process.env.NEXT_PUBLIC_LOGIN_CALLBACK}`,
    description: `${formatCustomerName(data.name.value ?? "")}`,
    domains: [
      { name: `${data.mailAddress.value?.split("@")[1]}`, verified: false },
    ],
    attributes: {
      products,
      typeOfPipeLine: [data.typeOfPipeLine.value ?? ""],
      registerNumber: [data.registerNumber.value ?? ""],
      gstin: [data.gstin.value ?? ""],
      agreementDate: [
        new Date(data.agreementDate.value ?? "").toLocaleDateString("en-GB"),
      ],
      phoneNumber: [data.phoneNumber.value ?? ""],
      mailAddress: [data.mailAddress.value ?? ""],
      street: [data.street.value ?? ""],
      area: [data.area.value ?? ""],
      pincode: [data.pincode.value ?? ""],
      country: [data.country.value ?? ""],
      state: [data.state.value ?? ""],
      district: [data.district.value ?? ""],
    },
  };

  if (customerId) {
    formData.id = customerId;
  }

  if (data.landmark.value !== "")
    formData.attributes.landmark = [data.landmark.value ?? ""];
  return formData;
};

export const extractPOCUserData = (
  data: CompanyPocFormData,
  customerId: string,
  assignedProducts: string[]
): UserPayload => {
  const randomPass = generateRandomPassword();
  const clientId =
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_NAME ?? "swasth-login";
  const userData: UserPayload = {
    enabled: true,
    email: data.email.value ?? "",
    emailVerified: true,
    firstName: data.firstName.value ?? "",
    lastName: data.lastName.value ?? "",
    credentials: [
      {
        temporary: true,
        type: "password",
        value: randomPass,
      },
    ],
    organizationId: customerId,
    attributes: {
      phoneNumber: [data.phoneNumber.value ?? ""],
      owner: ["true"],
    },
    clientRoles: {
      [clientId]: [UserRole.ADMIN],
    },
  };

  if (assignedProducts.length > 0) {
    userData.attributes = {
      ...userData.attributes,
      ASSIGNED_PRODUCTS: [...assignedProducts],
    };
  }
  return userData;
};

export const toggleArrayValue = (array: string[], value: string) => {
  return array.includes(value)
    ? array.filter((item) => item !== value)
    : [...array, value];
};

export const updateArray = (
  array: string[] | undefined | string,
  value: string
): string[] => {
  return Array.isArray(array)
    ? toggleArrayValue(array as string[], value)
    : [value];
};

export const generateRandomPassword = (): string => {
  return "Solinas@" + Math.random().toString(36).slice(2);
};

export const extractUserData = (
  data: UserFormData,
  customerId: string
): UserPayload => {
  const randomPass = generateRandomPassword();
  const clientId =
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_NAME ?? "swasth-login";
  const userData: UserPayload = {
    enabled: true,
    email: data.mailAddress.value ?? "",
    emailVerified: true,
    firstName: data.firstName.value ?? "",
    lastName: data.lastName.value ?? "",
    credentials: [
      {
        temporary: true,
        type: "password",
        value: randomPass,
      },
    ],
    organizationId: customerId,
    attributes: {
      phoneNumber: [data.phoneNumber.value ?? ""],
    },
    clientRoles: {
      [clientId]: [data.role.value as UserRole],
    },
  };

  const products = data.products.value;
  if (products && products.length > 0) {
    userData.attributes = {
      ...userData.attributes,
      ASSIGNED_PRODUCTS: [...products],
    };
  }

  if ((data.role.value as UserRole) === "fsa") {
    userData.attributes = {
      ...userData.attributes,
      ASSIGNED_CUSTOMERS: [...(data.customers.value ?? "")],
    };
  }
  return userData;
};

export const getCustomerId = (): string | null => {
  return getLocalStorage("CUSID");
};

export const formatCustomerName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const setCustomerInStorage = (
  customerId: string,
  customerName: string
) => {
  setLocalStorage("CUSID", customerId);
  setLocalStorage("CUSNAME", customerName);
};

export const validCustomerPath = (value: string): boolean => {
  const customeIdRegex =
    /^\/customers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return customeIdRegex.test(value);
};

export const getLogoName = (name: string): string => {
  const splittedName = name.split(" ");
  let logoName = splittedName[0].slice(0, 1);
  if (splittedName.length > 1) {
    logoName = logoName + splittedName[1].slice(0, 1);
  }
  return logoName;
};

export const processCustomers = (customers: Customer[]): Customer[] => {
  return customers
    .filter((customer: Customer) => customer.name !== "solinas")
    .map((customer: Customer) => ({
      ...customer,
      name: formatCustomerName(customer.name),
    }));
};

export const extractPOCUpdateData = (
  data: CompanyPocFormData,
  user: UserData
): UserUpdatePayload => {
  const payload: UserUpdatePayload = {
    firstName: data.firstName.value,
    lastName: data.lastName.value,
    email: data.email.value,
    attributes: user.attributes,
  };
  return payload;
};

export const getSolinas = (customers: Customer[]): Customer | undefined => {
  return customers.find((customer) => customer.name === Constants.SOLINAS);
};

export const getCustomerIds = (
  names: string[],
  customers: Customer[]
): string[] => {
  return names
    .map(
      (name) =>
        customers.find(
          (customer) => sanitizeCustomerName(customer.name) === name
        )?.id
    )
    .filter((id): id is string => id !== undefined);
};

export const extractSolinasUserData = (
  data: SolinasUserFormData,
  customerId: string
): UserPayload => {
  const randomPass = generateRandomPassword();
  const clientId =
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_NAME ?? "swasth-login";
  const userData: UserPayload = {
    enabled: true,
    email: data.mailAddress.value ?? "",
    emailVerified: true,
    firstName: data.firstName.value ?? "",
    lastName: data.lastName.value ?? "",
    credentials: [
      {
        temporary: true,
        type: "password",
        value: randomPass,
      },
    ],
    organizationId: customerId,
    attributes: {},
    clientRoles: {
      [clientId]: [UserRole.FSA],
    },
  };

  const products = data.products.value;
  if (products && products.length > 0) {
    userData.attributes = {
      ...userData.attributes,
      ASSIGNED_PRODUCTS: [...products],
    };
  }

  const customers = data.customers.value;
  if (customers && customers.length > 0) {
    userData.attributes = {
      ...userData.attributes,
      ASSIGNED_CUSTOMERS: [...customers],
    };
  }

  return userData;
};

export const debounceFunction = (callback: () => void) => {
  const delayedFunction = setTimeout(() => {
    callback();
  }, 500);
  return delayedFunction;
};

export const addNumberTab = (prev: NumberTabData): NumberTabData => {
  const nextId =
    prev.tabs.length > 0 ? Math.max(...prev.tabs.map((tab) => tab.id)) + 1 : 1;
  const newTab = { id: nextId };
  return {
    active: nextId,
    tabs: [...prev.tabs, newTab],
  };
};

export const removeNumberTab = (
  prev: NumberTabData,
  id: number
): NumberTabData => {
  const updatedTabs = prev.tabs.filter((tab) => tab.id !== id);
  return {
    ...prev,
    tabs: updatedTabs,
  };
};

export const switchNumberTab = (
  prev: NumberTabData,
  id: number
): NumberTabData => {
  const index = prev.tabs.findIndex((tab) => tab.id === id);
  const exists = index !== -1;

  if (exists) {
    return { ...prev, active: id };
  }

  const deletedIndex = prev.tabs.findIndex((tab) => tab.id > id);
  const fallbackTab =
    prev.tabs[deletedIndex] || prev.tabs[prev.tabs.length - 1];

  return {
    ...prev,
    active: fallbackTab?.id ?? null,
  };
};

export const handleBackgroundProcess = (
  progress: UploadProgress,
  queue: VideoQueueData,
  userId: string
): VideoQueueData[] | null => {
  if (!progress || !progress.uploadId) return null;

  const existing: VideoQueueData[] = JSON.parse(
    getLocalStorage("progress") ?? "[]"
  );

  const updatedQueue: VideoQueueData = {
    ...queue,
    percent: progress.progressPercentage,
  };

  const updated = existing.map((item) =>
    item.uploadId === updatedQueue.uploadId ? updatedQueue : item
  );

  const isNew = !existing.find(
    (item) => item.uploadId === updatedQueue.uploadId
  );

  if (isNew) updated.push(updatedQueue);

  setLocalStorage("progress", JSON.stringify(updated));
  return updated.filter((queue: VideoQueueData) => queue.userId === userId);
};

export function parseToShowDataProps(
  data: any,
  combineKeys: string[] = []
): ShowDataProps[] {
  const result: ShowDataProps[] = [];

  const formatLabel = (key: string) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const parse = (obj: any, currentKey: string) => {
    if (combineKeys.includes(currentKey) && typeof obj === "object") {
      const combinedValue = Object.values(obj).join(", ");
      result.push({ label: formatLabel(currentKey), value: combinedValue });
    } else if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        parse(value, key);
      }
    } else {
      result.push({ label: formatLabel(currentKey), value: String(obj) });
    }
  };

  for (const [key, value] of Object.entries(data)) {
    parse(value, key);
  }

  return result;
}

export const extractDefectImageData = (
  data: DefectFormData,
  image: string,
  defectId: string,
  videoId: string
): DefectImageData => {
  const blob = base64ToFileOrBlob(
    image,
    data.title.value ?? "",
    "image/png",
    true
  );
  const updated: DefectImageData = {
    file: new File([blob], formatFileName(data.title.value ?? "", "png"), {
      type: "image/png",
    }),
    title: data.title.value ?? "",
    description: data.description.value ?? "",
    imageMetadata: [
      {
        videoId,
        timestamp: data.timeStamp.value ?? "",
        distance: data.distance.value + "m",
        direction: data.direction.value ?? "",
        defectTypeId: defectId.toString(),
        clock: `${data.clockStart.value ?? ""},${data.clockEnd.value}`,
      },
    ],
  };
  return updated;
};

export const getSeverityColor = (severity: number | string): string => {
  let color = "snow";
  const data = typeof severity === "string" ? parseFloat(severity) : severity;
  if (data >= 4) {
    color = "candyRed";
  } else if (data > 3) {
    color = "harvestGold";
  } else if (data > 0) {
    color = "gold";
  }
  return color;
};

export const extractObservationImageData = (
  data: ObservationFormData,
  videoId: string
): DefectImageData => {
  const updated: DefectImageData = {
    title: data.title.value ?? "",
    description: data.description.value ?? "",
    imageMetadata: [
      {
        videoId,
        timestamp: data.timeStamp.value ?? "",
        distance: data.distance.value + "m",
        direction: data.direction.value ?? "",
        clock: `${data.clockStart.value ?? ""},${data.clockEnd.value}`,
      },
    ],
  };
  return updated;
};

export const extractImageMetaData = (
  data: DefectFormData | ObservationFormData,
  defectId: string | undefined
): ImageMetaPayload => {
  const payload: ImageMetaPayload = {
    title: data.title.value,
    description: data.description.value,
    imageMetadata: [
      {
        distance: data.distance.value + "m",
        direction: data.direction.value,
        clock: `${data.clockStart.value},${data.clockEnd.value}`,
        timestamp: data.timeStamp.value,
      },
    ],
  };
  if (defectId) {
    payload.imageMetadata[0].defectTypeId = defectId.toString();
  }
  return payload;
};

export const extractDefectImages = (inspection:any) => {
  return inspection.defectsMeta?.flatMap(
    (meta: any) => meta.defectsImages ?? []
  ) ?? [];
};

export const groupDefectsByDistance = (defectsImages: any[]) => {
  return defectsImages
    .sort((firstImage: any, secondImage: any) => {
      const distOfFirstimage = firstImage.defects?.[0]?.distance ?? 0;
      const distOfSecondImage = secondImage.defects?.[0]?.distance ?? 0;
      return distOfFirstimage - distOfSecondImage;
    })
    .reduce((acc: Record<number, any[]>, img: any) => {
      const distance = img.defects?.[0]?.distance ?? 0;
      const scale = Math.floor(distance);
      if (!acc[scale]) acc[scale] = [];
      acc[scale].push(img);
      return acc;
    }, {});
};
