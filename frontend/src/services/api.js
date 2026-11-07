import axios from "axios";

/** One Axios client keeps the API address and authentication header consistent. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("readers-paradise-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      localStorage.removeItem("readers-paradise-token");
      window.dispatchEvent(new Event("readers-paradise:session-expired"));
    }
    return Promise.reject(error);
  },
);

/** Turn FastAPI validation and server errors into a readable message. */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(" ");
  return error.message === "Network Error"
    ? "The Readers Paradise API is unavailable. Start the backend and try again."
    : fallback;
}
