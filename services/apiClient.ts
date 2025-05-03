import axios from "axios";
import { getSession } from "next-auth/react";
import { createApiResponse, getErrorMessage, getCustomerId } from "@/helpers/helper";
import Constants from "@/constants/constants";

/* Other than Auth Servive */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    config.headers["Content-Type"] = "application/json";
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    const swasthCustomerId = config.headers[Constants.X_SWASTH_CUST_ID] || getCustomerId();
    config.headers[Constants.X_SWASTH_CUST_ID] = swasthCustomerId;
    return config;
  },
  (error) => Promise.reject(error)
);

/* Other than Auth Servive */

/* For Auth Service */

const getAuthInfo = (): { domain: string; realm: string } => {
  const url = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ?? "";
  const splittedUrl = url.split("/");
  const domain = new URL(url).origin + "/" + splittedUrl[3];
  const realm = splittedUrl[splittedUrl.length - 1];
  return {
    domain,
    realm,
  };
};

const authClient = axios.create({
  baseURL: getAuthInfo().domain + "/admin/realms/" + getAuthInfo().realm,
});

authClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    config.headers["Content-Type"] = "application/json";
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* For Auth Service */

const handleApiError = (error: any, functionName: string) => {
  console.error(`Error in ${functionName}:`, error);

  return createApiResponse(
    error?.response?.status || 500,
    getErrorMessage(error),
    null
  );
};

export { apiClient, authClient, getAuthInfo, handleApiError };
