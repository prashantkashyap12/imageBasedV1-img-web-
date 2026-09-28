import { post, get, del } from "./api_helper";
import * as url from "./url_helper";

//Subscription Api

export const addPackage = async (packageData) => {
  const urls = await url.getUrls();
  return post(urls.ADD_PACKAGE, packageData);
};

export const getPackages = async () => {
  const urls = await url.getUrls();
  return get(urls.GET_PACKAGES);
};

export const deletePackage = async (packageId) => {
  const urls = await url.getUrls();
  return del(`${urls.DELETE_PACKAGE}?PackId=${packageId}`);
};

// Payment api

export const createPayment = async ({ data }) => {
  const urls = await url.getUrls();
  return post(urls.PAYMENT, data);
};

export const verifyPayment = async (orderId) => {
  const urls = await url.getUrls();
  return get(`${urls.PAYMENT_VERIFICATION}/${orderId}`);
};

export const paymentHistory = async () => {
  const urls = await url.getUrls();
  return get(urls.PAYMENT_HISTORY);
};
