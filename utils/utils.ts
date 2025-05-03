import Constants from "@/constants/constants";
import axios from "axios";
import { pdf } from "@react-pdf/renderer";

export const updateObject = <T>(
  data: T,
  key: keyof T,
  value: T[keyof T]
): T => {
  return { ...data, [key]: value };
};

export const setLocalStorage = (key: string, value: any): void => {
  localStorage.setItem(key, value);
};

export const getLocalStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const removeLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};

export const isNumber = (value: string) => {
  if (typeof value !== "string") return false;
  return /^\d+(\.\d+)?$/.test(value.trim());
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "short" });
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
};

export const isValidPincode = (value: string) => {
  if (/^\d+$/.test(value) && value.length === 6) return true;
  return false;
};

export const isValidGPS = (value: string): boolean => {
  const regex = /^-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?$/;
  if (!regex.test(value)) return false;

  const [lat, lon] = value.split(",").map(Number);
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

export const convertToKm = (value: string) => {
  if (!value) return "";
  const meters = parseFloat(value);
  return meters >= 1000 ? meters / 1000 + "km" : meters + "m";
};

export const extractNumber = (value: string) => {
  return Number.parseFloat(value);
};

export const capitalizeFirstLetter = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

export const generateVideoThumbnail = async (
  videoUrl: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.currentTime = 2;
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = async () => {
      try {
        await new Promise<void>((res) => {
          video.onseeked = () => res();
          video.currentTime = 2;
        });

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth / 2;
        canvas.height = video.videoHeight / 2;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageUrl = canvas.toDataURL("image/png");
          resolve(imageUrl);
        } else {
          reject("Failed to create thumbnail");
        }
      } catch (error) {
        reject("Error processing video");
      }
    };

    video.onerror = () => reject("Error loading video");
  });
};

export const isValidTimeStamp = (value: string): boolean => {
  if (!value) return false;

  const splittedTimestamp = value.split(":");

  if (splittedTimestamp.length !== 3) return false;

  const [hours, minutes, seconds] = splittedTimestamp;

  const isValidPart = (part: string, max: number) =>
    /^\d{2}$/.test(part) && Number(part) >= 0 && Number(part) <= max;

  return (
    isValidPart(hours, 23) &&
    isValidPart(minutes, 59) &&
    isValidPart(seconds, 59)
  );
};

export const convertTimeToSeconds = (time: string): number => {
  const parts = time.split(":").map(Number);

  if (parts.some(isNaN)) throw new Error("Invalid time format");

  switch (parts.length) {
    case 1:
      return parts[0];
    case 2:
      return parts[0] * 60 + parts[1];
    case 3:
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    default:
      throw new Error("Invalid time format");
  }
};

export const downloadImage = async (
  imageUrl: string,
  name: string
): Promise<boolean> => {
  try {
    const response = await axios.get(imageUrl, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    const match = new URL(imageUrl).pathname.match(
      /\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff)$/i
    );
    const extension = match ? `.${match[1]}` : ".jpg";
    link.download = `${name}${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Error downloading image:", error);
    return false;
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isValidGSTIN = (gstin: string): boolean => {
  const gstinRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

export const imageToBlob = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        resolve(new Blob([reader.result], { type: file.type }));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const createCustomerIdHeader = (customerId?: string) => ({
  headers: {
    [Constants.X_SWASTH_CUST_ID]: customerId,
  },
});

export const downloadPdfFile = async ({
  component,
  fileName,
}: {
  component: JSX.Element;
  fileName: string;
}) => {
  try {
    const blob = await pdf(component).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading PDF:", error);
  }
};

export const formatVideoTimeStamp = (time: number): string => {
  const hours = String(Math.floor(time / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
  const seconds = String(Math.floor(time % 60)).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export const formatFileName = (input: string, format: "png"): string => {
  return input.trim().toLowerCase().replace(/\s+/g, "_") + "." + format;
};

export const base64ToFileOrBlob = (
  base64: string,
  fileName: string,
  mimeType: "image/png",
  isFile = true
) => {
  // Step 1: Remove the base64 prefix if present
  const base64Data = base64.split(",")[1];

  // Step 2: Decode the base64 data into binary
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  // Step 3: Convert the decoded binary data to a byte array
  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  // Step 4: Create the Blob object
  const blob = new Blob(byteArrays, { type: mimeType });

  // Step 5: If `isFile` is true, return a File object with the given filename
  if (isFile) {
    return new File([blob], formatFileName(fileName, "png"), { type: mimeType });
  }

  // Otherwise, return just the Blob
  return blob;
};
