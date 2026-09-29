import { post, get, del } from "./api_helper";
import * as url from "./url_helper";
import { toast } from "react-toastify"; // added
import axiosApi from "../Interceptor/axios"; // added

export const fetchCsvHeader = async (file) => {
  const urls = await url.getUrls();

  const formData = new FormData();
  formData.append("CSV1", file); // ✅ FIXED KEY

  return post(urls.GETCSVHEADER, formData);
};

export const generateResult = async (formData) => {
  const urls = await url.getUrls();

  return post(urls.GENERATE_RESULT, formData, {
    responseType: "blob",
  });
};

/**
 * NEW – POST multipart → api/ResultGenration/GenerateResultExcel2
 *
 * Uses axiosApi directly instead of api_helper.post because that wrapper reads
 * error.response.data.message, which is a Blob when responseType is "blob",
 * so the user would only ever see "Something went wrong".
 * Do NOT set Content-Type manually – axios adds the multipart boundary itself.
 */
export const generateResultExcel2 = async (formData) => {
  const urls = await url.getUrls();

  try {
    const res = await axiosApi.post(urls.GENERATE_RESULT_EXCEL2, formData, {
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    let message = "Result generation failed. Please try again.";
    const data = error?.response?.data;

    if (data instanceof Blob) {
      try {
        const text = await data.text();
        try {
          message = JSON.parse(text)?.message || message;
        } catch {
          message = text || message; // plain-text error body
        }
      } catch {
        /* keep default message */
      }
    } else if (data?.message) {
      message = data.message;
    }

    toast.error(message);
    throw error;
  }
};

export const mergerCsv = async (formData) => {
  const urls = await url.getUrls();

  return post(urls.MERGECSV, formData, {
    responseType: "blob",
  });
};

export const getDBRecords = async (fileName = "") => {
  const urls = await url.getUrls();

  const finalUrl = fileName
    ? `${urls.GET_DB_DATA}?fileName=${fileName}`
    : urls.GET_DB_DATA;

  return get(finalUrl);
};

export const deleteDBRecords = async (deleteName) => {
  const urls = await url.getUrls();
  const endpoint = `${urls.DELETE_DB_DATA}?deleteName=${deleteName}`;

  return await del(endpoint);
};