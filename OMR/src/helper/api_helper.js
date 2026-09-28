import { toast } from "react-toastify";

import axiosApi from "../Interceptor/axios"

export async function get(url, config = {}) {
  try {
    const response = await axiosApi.get(url, {
      ...config,
      headers: {
        ...(config.headers || {}),
        "Cache-Control": "no-cache, no-store, must-revalidate", 
        Pragma: "no-cache",
        Expires: "0",
      },
      params: {
        ...(config.params || {}),
        _ts: Date.now(),
      },
    });

    return response.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Something went wrong"
    );
    throw error;
  }
}

export async function post(url, data = {}, config = {}) {
  try {
    const response = await axiosApi.post(url, data, config);
    return response.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Something went wrong"
    );
    throw error;
  }
}

export async function postWithFormData(url, data, config = {}) {
  return axiosApi
    .post(url, data, { ...config })
    .then((response) => response.data)
    .catch((error) => {
      toast.error(error?.response?.data?.message);
    });
}


export async function putWithFormData(url, data, config = {}) {
  return axiosApi
    .put(url, data, { ...config })
    .then((response) => response.data)
    .catch((error) => {
      toast.error(error?.response?.data?.message);
    });
}
export async function put(url, data, config = {}) {
  return axiosApi
    .put(url, { ...data }, { ...config })
    .then((response) => response.data)
    .catch((error) => {
      toast.error(error?.response?.data?.message);
    });
}

export async function del(url, config = {}) {
  console.log("from the del --->", url);
  try {
    const response = await axiosApi.delete(url, config);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Delete failed");
    throw error;
  }
}
