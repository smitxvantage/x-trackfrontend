import axios from "axios";

// Auto switch URL based on environment
const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://xtrack.xvantageinfotech.com/api";

export const api = axios.create({
  baseURL,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("xtrack_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
