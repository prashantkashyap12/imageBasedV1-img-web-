
import axios from "axios";
import { getRefreshTokenUrl } from "helper/userManagment_helper";

const API_URL = ""; // Add your base URL if applicable

const axiosApi = axios.create({
  baseURL: API_URL,
});

// Request Interceptor
axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response Interceptor

axiosApi.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;


    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshUrl = await getRefreshTokenUrl(); // await the async function

      // If the refresh call itself got 401, logout
      if (originalRequest.url?.includes(refreshUrl)) {
        localStorage.clear();
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const expiredToken = localStorage.getItem("token"); // ← send expired token, not refreshToken

        if (!expiredToken) {
          throw new Error("No token available");
        }

        const response = await axios.get(refreshUrl, {
          headers: {
            Authorization: `Bearer ${expiredToken}`,
          },
        });


        const newToken = response.data.token

        if (!newToken) {
          throw new Error("Failed to refresh token");
        }

        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newToken);

        axiosApi.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosApi(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/auth/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosApi;
