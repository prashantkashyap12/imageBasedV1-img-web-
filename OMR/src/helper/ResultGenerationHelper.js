import { post, get, del } from "./api_helper";
import * as url from "./url_helper";

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

export const mergerCsv = async (formData) => {
  const urls = await url.getUrls();

  return post(urls.MERGECSV, formData, {
    responseType: "blob",
  })
}

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
