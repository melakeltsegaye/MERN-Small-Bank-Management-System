import axiosInstance from "./axiosInstance.js";

export const getAuditLogsApi = (params) => axiosInstance.get("/audit-logs", { params });