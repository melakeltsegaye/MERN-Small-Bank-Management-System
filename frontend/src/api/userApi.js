import axiosInstance from "./axiosInstance";

export const getUsers = (params) => axiosInstance.get("/users", { params }).then((r) => r.data);
export const createStaffUser = (payload) => axiosInstance.post("/users", payload).then((r) => r.data);
export const updateUserRole = (id, role) => axiosInstance.patch(`/users/${id}/role`, { role }).then((r) => r.data);
export const updateUserStatus = (id, status) => axiosInstance.patch(`/users/${id}/status`, { status }).then((r) => r.data);
