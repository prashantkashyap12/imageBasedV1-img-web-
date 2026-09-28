import { post, get, } from './api_helper';
import * as url from './url_helper';
import axiosApi from 'Interceptor/axios';

// Create Class

export const fetchProcessData = async () => {
  const urls = await url.getUrls();
  return get(urls.GET_PROCESS_24_PAGE_DATA);
};



export const scanFiles = async (selectedValue, userId, files = []) => {
  const urls = await url.getUrls();
  const token = localStorage.getItem("token");

  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  return post(
    `${urls.SCAN_IMAGES}?folderPath=${selectedValue}&token=${token}&idTemp=${userId}&IsSaveDb=${true}`,
    formData
  );
};


// export const scanFiles = async (selectedValue, userId, saveDb ) => {
//   const urls = await url.getUrls();
//   const token = localStorage.getItem('token');

//   return post(
//     `${urls.SCAN_FILES}?folderPath=${selectedValue}&token=${localStorage.getItem(
//       'token'
//      )}&idTemp=${userId}&IsSaveDb=${true}`,
//     null,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
// };


export const getLastScannedFiles = async (tempId) => {
  const urls = await url.getUrls();
  const token = localStorage.getItem('token');
  return get(
    `${urls.LAST_RECORDS}?TempId=${tempId}&token=${localStorage.getItem(
      'token'
    )}`, // saveDb is added to control whether to save data in the database or not
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// export const printData = async (data) => {
//   const urls = await url.getUrls();
//   const endpoint = urls.PRINT_DATA;
//   return await post(endpoint, data);
// };

// export const refreshScanner = async () => {
//   const urls = await url.getUrls();
//   return get(urls.REFRESH_SCANNER);
// };

// export const checkPrintData = async (layoutId) => {
//   const urls = await url.getUrls();
//   return get(`${urls.CHECK_PRINT}?LayoutId=${layoutId}`);
// };

// export const getDataByRowRange = async (startRow, endRow, LayoutId, UserId) => {
//   const urls = await url.getUrls();
//   return get(
//     `${urls.GET_ROW_DATA}?startRow=${startRow}&endRow=${endRow}&LayoutId=${LayoutId}&UserId=${UserId}`
//   );
// };

// export const getTotalExcellRow = async (LayoutId, UserId) => {
//   try {
//     const urls = await url.getUrls();

//     const FINAL_URL = `${urls.GET_TOTAL_EXCEL_ROW}?LayoutId=${LayoutId}&UserId=${UserId}`;
//     console.log('API URL:', FINAL_URL);

//     const res = await get(FINAL_URL);
//     return res;
//   } catch (error) {
//     if (error?.response?.status === 404) {
//       console.warn('GET_TOTAL_EXCEL_ROW API not found (404 ignored safely)');
//       return 0; // ✅ Prevents runtime crash
//     }

//     console.error('GET_TOTAL_EXCEL_ROW API Error:', error);
//     return 0; // ✅ Prevents UI crash for any API failure
//   }
// };

export const pauseScanning = async () => {
  const urls = await url.getUrls();
  return post(`${urls.PAUSE_SCAN}`);
};

export const resumeScanning = async () => {
  const urls = await url.getUrls();
  return post(`${urls.RESUME_SCAN}`);
};

export const resetScanApi = async () => {
  const urls = await url.getUrls();
  return post(`${urls.SCAN_API_RESET}`);
};


// GET Scanned Data
export const scannedData = async (folderName, currentPage, PageSize, templateId) => {
  const PageNo = currentPage
  // const PageSize = 1000
  const urls = await url.getUrls();
 
  return axiosApi.get(`${urls.SCAN_PAGINATION}?folderName=${folderName}&PageNo=${PageNo}&PageSize=${PageSize}&tempId=${templateId}`)
};