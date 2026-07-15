import axiosInstance from "./axiosInstance";

export const getMyAccounts = () => axiosInstance.get("/accounts/me").then((r) => r.data);
export const getAccounts = (params) => axiosInstance.get("/accounts", { params }).then((r) => r.data);
export const getAccountById = (id) => axiosInstance.get(`/accounts/${id}`).then((r) => r.data);
export const openAccount = (payload) => axiosInstance.post("/accounts", payload).then((r) => r.data);
export const updateAccountStatus = (id, status) =>
  axiosInstance.patch(`/accounts/${id}/status`, { status }).then((r) => r.data);
export const getAccountTransactions = (id, params) =>
  axiosInstance.get(`/accounts/${id}/transactions`, { params }).then((r) => r.data);
