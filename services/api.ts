import axios from "axios";

const DataBaseURL = process.env.NEXT_PUBLIC_DataBaseURL;

export const AuthAPI = axios.create({
  baseURL: DataBaseURL,
});

AuthAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

AuthAPI.interceptors.response.use(
  (res) => {  
    return res;
  },

  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();

      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);
