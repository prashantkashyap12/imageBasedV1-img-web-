import { post, del, get, put } from "./api_helper";
import * as url from "./url_helper";

// Create Class
export const createUser = async (data) => {
  const { name, email, cont, role, pwd } = data;
  const urls = await url.getUrls();
  return post(
    `${urls.CREATE_USER}?name=${name}&email=${email}&cont=${cont}&role=${role}&pwd=${pwd}`,
  );
};

export const updateUser = async (data) => {
  const urls = await url.getUrls();

  const body = {

    empId: data.empid,
    empName: data.name,
    empEmail: data.email,
    password: data.pwd,
    contact: data.cont,
    role: data.role,
  }

  return put(urls.UPDATE_USER, body);
};

export const removeUser = async (id) => {
  const urls = await url.getUrls();
  return del(`${urls.DELETE_USER}?idEmp=${id}`);
};

export const fetchAllUsers = async () => {
  const urls = await url.getUrls();
  const token = localStorage.getItem("token");
  return post(urls.GET_USERS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUserRoles = async () => {
  const urls = await url.getUrls();
  return get(urls.GET_USER_ROLES);
};

export const login = async (uname, pwd) => {
  const urls = await url.getUrls();

  return post(`${urls.LOGIN}?uname=${uname}&pwd=${pwd}`);
};


//REFERESH TOKEN
export const getRefreshTokenUrl = async () => {
  const urls = await url.getUrls();
  return urls.REFERESH_TOKEN;
};
