import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send httpOnly refresh cookie
});

// Attach access token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, try to refresh the access token once, then retry the request
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/auth/login")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post("/auth/refresh");
        localStorage.setItem("accessToken", data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;



// User logs in
//         │
//         ▼
// Access Token → localStorage
// Refresh Token → httpOnly Cookie
//         │
//         ▼
// axiosInstance.get("/accounts")
//         │
//         ▼
// Request Interceptor
//         │
//         ▼
// Adds:
// Authorization: Bearer <accessToken>
//         │
//         ▼
// Backend
//         │
//    ┌────┴────┐
//    │         │
// Token OK   Token Expired
//    │         │
//    ▼         ▼
// 200 OK     401 Unauthorized
//              │
//              ▼
//      Response Interceptor
//              │
//              ▼
// POST /auth/refresh
// (using the refresh-token cookie)
//              │
//    ┌─────────┴─────────┐
//    │                   │
// Refresh succeeds   Refresh fails
//    │                   │
//    ▼                   ▼
// Save new access   Remove token
// Retry request     Redirect to /login