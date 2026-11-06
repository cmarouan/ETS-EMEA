import axios from "axios";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "/api";
const baseURL = configuredApiUrl.endsWith("/api") ? configuredApiUrl : `${configuredApiUrl}/api`;

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject(error);
  },
);
