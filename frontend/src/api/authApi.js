import axiosInstance from "./axiosInstance";

export const registerUser = (payload) => axiosInstance.post("/auth/register", payload).then((r) => r.data);
export const loginUser = (payload) => axiosInstance.post("/auth/login", payload).then((r) => r.data);
export const logoutUser = () => axiosInstance.post("/auth/logout").then((r) => r.data);
export const fetchMe = () => axiosInstance.get("/auth/me").then((r) => r.data);