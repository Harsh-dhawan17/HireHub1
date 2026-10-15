import axios, { AxiosError } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// Request interceptor to attach Bearer token and handle FormData headers cleanly
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("hirehub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If request data is FormData, remove manual Content-Type header so browser/axios sets multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Standardize error message extraction
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    // Attach cleaner error message for downstream catch blocks
    return Promise.reject(new Error(backendMessage));
  }
);

export default apiClient;
