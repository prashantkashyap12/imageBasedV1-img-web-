import axios from "axios";
import { fetchAllUsers } from "helper/userManagment_helper";
import { toast } from "react-toastify";
import API_NODE from "WebData/apiNode/apiNode";
function extractIP(serverString) {
  const match = serverString.match(/(\d+\.\d+\.\d+\.\d+)/);
  return match ? match[0] : null;
}

export const REACT_APP_IP = window.APP_IP;
export const SERVER_IP = window.SERVER_IP;

export const onGetTemplateHandler = async () => {
  try {
    const response = await API_NODE.post("/get/templetes", {});

    return response.data;
  } catch (error) {
    console.log(error);
  }
};


export const onGetAllUsersHandler = async () => {
  
  try {
    const data = await  fetchAllUsers();
    return (data?.result || [])
  } catch (error) {
    toast.error(error.message);
  }
};

export const onGetVerifiedUserHandler = async () => {
  // const token = JSON.parse(localStorage.getItem("userData"));
  // if (!token) {
  //   return;
  // }
  try {
    const response = await API_NODE.post(
      `${window.SERVER_IP}/users/getuser`,
      {},
    );

    return response.data;
  } catch (error) {}
};

export const onGetAllTasksHandler = async () => {
  // const token = JSON.parse(localStorage.getItem("userData"));

  try {
    const response = await API_NODE.get(`${window.SERVER_IP}/get/alltasks`, {

    });
    return response.data;
  } catch (error) {
    toast.error(error.message);
  }
};

export const onGetTaskHandler = async (id) => {
  // const token = JSON.parse(localStorage.getItem("userData"));
  try {
    const response = await API_NODE.get(`${window.SERVER_IP}/get/task/${id}`, {
      // headers: {
      //   token: token,
      // },
    });
    return response.data;
  } catch (error) {
    toast.error(error.message);
  }
};

export const fetchFilesAssociatedWithTemplate = async (templateId) => {
  const token = JSON.parse(localStorage.getItem("userData"));

  try {
    const response = await API_NODE.post(
      `${window.SERVER_IP}/getUploadedFiles/${templateId}`,
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchLatestTaskData = async (taskId) => {
  const token = JSON.parse(localStorage.getItem("userData"));

  const response = await axios.get(
    `${window.SERVER_IP}/getTask/${taskId}`,
    { headers: { token } }
  );
  return response.data; // Return latest task data
};
export const fetchTemplateFormData = async (templateId, colName) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  const obj = { templateId, colName };
  const response = await API_NODE.post(
    `${window.SERVER_IP}/formfileddetails/`,
    obj,
    { headers: { token } }
  );
  return response.data; // Return latest task data
};

export const fetchIP = async () => {
  const token = JSON.parse(localStorage.getItem("userData"));

  const response = await axios.get(
    `${window.SERVER_IP}/settings/get-device-ip`,
    { headers: { token } }
  );
  return response.data;
};

export const fetchHeadersInDuplicate = async (templateId) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  // http://localhost:4000/getcsvheaders?templateId=1
  try {
    const response = await axios.get(
      `${window.SERVER_IP}/getcsvheaders?templateId=${templateId}`,
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const checkMappedDataExits = async (templateId) => {
  // const token = JSON.parse(localStorage.getItem("userData"));
  // http://localhost:4000/getcsvheaders?templateId=1
  try {
    const response = await API_NODE.get(
      `${window.SERVER_IP}/checkmappeddataexits?templateId=${templateId}`,

    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error?.response?.data;
  }
};

export const submitMappedData = async (mappedData) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  // http://localhost:4000/getcsvheaders?templateId=1
  
  try {
    // const templateId = await JSON.parse(localStorage.getItem("templeteId"));
    const response = await API_NODE.post(
      `${window.SERVER_IP}/data`,
      mappedData,
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getTotalCSVData = async (templateId, fileId) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  // http://localhost:4000/getcsvheaders?templateId=1
  try {
    const response = await axios.get(
      `${window.SERVER_IP}/gettotaldata?templateId=${templateId}&fileId=${fileId}`,
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const assignTasksToUsers = async (assignedUsers) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  // http://localhost:4000/getcsvheaders?templateId=1
  try {
    const response = await API_NODE.post(
      `${window.SERVER_IP}/assign/user`,
      assignedUsers,
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const dataEntryMetaData = async (templateId, columnName) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  // http://localhost:4000/getcsvheaders?templateId=1
  try {
    const response = await axios.get(
      `${window.SERVER_IP}/get/metadata?templateId=${templateId}&columnName=${columnName}`,
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateCurrentIndex = async (taskId, direction,parentId, userEmail) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  // http://localhost:4000/getcsvheaders?templateId=1
  try {
    const response = await API_NODE.post(
      `${window.SERVER_IP}/update/currentIndex`,
      {
        taskId: taskId,
        direction: direction,
        parentId:parentId,
        userEmail: userEmail
      },
      // {
      //   headers: {
      //     token: token,
      //   },
      // }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateCsvData = async (obj) => {
  // const token = JSON.parse(localStorage.getItem("userData"));
  // http://localhost:4000/getcsvheaders?templateId=1
  try {
    const response = await API_NODE.post(
      `${window.SERVER_IP}/update/csvdata`,
      obj,
    );
    return response;
  } catch (error) {
    console.log(error);
    return error
  }
};

export const getRowCsvData = async (taskId, rowId) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  // http://localhost:4000/getcsvheaders?templateId=1
  try {
    const response = await API_NODE.get(
      `${window.SERVER_IP}/getCsvRowData?taskId=${taskId}&rowId=${rowId}`,

      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateCurrIndexData = async (taskId, direction) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  try {
    const response = await API_NODE.post(
      `${window.SERVER_IP}/updateCurrentIndex`,
      {
        taskId: taskId,
        direction: direction,
      },
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getMetaData = async (columnName, templateId) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  try {
    const response = await axios.get(
      `${window.SERVER_IP}/get/metadata?columnName=${columnName}&templateId=${templateId}`,

      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const changeTaskStatus = async (taskId) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  try {
    const response = await API_NODE.post(
      `${window.SERVER_IP}/taskupdation/${taskId}`,
      {
        taskStatus: 1,
      },
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error?.response?.data;
  }
};

export const getDuplicateData = async (columnName, fileId) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  try {
    const response = await API_NODE.post(
      `${window.SERVER_IP}/duplicate/data`,
      {
        colName: columnName,
        fileID: fileId,
      },
      {
        headers: {
          token: token,
        },
      },
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error?.response?.data;
  }
};

export const getDuplicateDataWithValue = async (columnName, fileId, value) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  try {
    const response = await API_NODE.post(
      `${window.SERVER_IP}/get/duplicate/data`,
      {
        columnName: columnName,
        fileId: fileId,
        value: value,
      },
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error?.response?.data;
  }
};

export const updateDuplicateDataWithValue = async (id, fileID, rowData) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  try {
    const response = await API_NODE.post(
      `${window.SERVER_IP}/update/duplicatedata`,
      {
        id,
        fileID,
        rowData,
      },
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error?.response?.data;
  }
};

export const deleteDuplicateDataWithValue = async (rowId, fileId) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  try {
    const response = await axios.delete(
      `${window.SERVER_IP}/deleteRow?rowId=${rowId}&fileId=${fileId}`,
      {
        headers: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error?.response?.data;
  }
};
