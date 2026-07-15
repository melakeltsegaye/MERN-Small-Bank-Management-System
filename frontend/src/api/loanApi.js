import axiosInstance from "./axiosInstance";

export const applyForLoan = (payload) => axiosInstance.post("/loans", payload).then((r) => r.data);
export const getMyLoans = () => axiosInstance.get("/loans/me").then((r) => r.data);
export const getLoans = (params) => axiosInstance.get("/loans", { params }).then((r) => r.data);
export const getLoanById = (id) => axiosInstance.get(`/loans/${id}`).then((r) => r.data);
export const reviewLoan = (id, payload) => axiosInstance.patch(`/loans/${id}/review`, payload).then((r) => r.data);
export const approveLoan = (id) => axiosInstance.patch(`/loans/${id}/approve`).then((r) => r.data);
export const rejectLoan = (id, reason) => axiosInstance.patch(`/loans/${id}/reject`, { reason }).then((r) => r.data);
export const disburseLoan = (id) => axiosInstance.post(`/loans/${id}/disburse`).then((r) => r.data);
