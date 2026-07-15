import axiosInstance from "./axiosInstance";

export const depositToAccount = (accountId, payload) =>
  axiosInstance.post(`/accounts/${accountId}/deposit`, payload).then((r) => r.data);

export const withdrawFromAccount = (accountId, payload) =>
  axiosInstance.post(`/accounts/${accountId}/withdraw`, payload).then((r) => r.data);

export const transferFunds = (payload) =>
  axiosInstance.post("/transactions/transfer", payload).then((r) => r.data);
