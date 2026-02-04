import { api } from "../lib/axios";
export const getMyReportsApi = () => api.get("/api/daily-reports/me");

export const createReportApi = (data: any) =>
  api.post("/api/daily-reports", data);

export const updateReportApi = (
  id: number,
  payload: {
    tasks: string;
    hoursSpent: number;
    admin?: string;
  },
) => {
  return api.put(`/api/daily-reports/${id}`, payload);
};

export const getDailyReportsApi = () => {
  return api.get("/api/daily-reports");
};

export const approveDailyReportApi = (id: number, admin: string) => {
  return api.post(`/api/daily-reports/${id}/approve`, {
    admin,
  });
};

export const rejectDailyReportApi = (id: number) => {
  return api.post(`/api/daily-reports/${id}/reject`, {});
};
