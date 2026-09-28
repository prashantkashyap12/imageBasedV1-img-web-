import axios from "axios";

const API_NODE = axios.create({
  baseURL: "http://localhost:7000",
});

API_NODE.interceptors.request.use((config) => {
  config.headers.token = "abc123xyz"; // 👈 static token
  return config;
});

export default API_NODE;