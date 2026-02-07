import { api } from "@/lib/axios";

export const getEmployeeDailySummaryApi = (params: {
  date?: string;
  range?: "day" | "week" | "month";
  userId?: number | "";
}) => {
  return api.get("/api/admin/employee-daily-summary", {
    params,
  });
};

export const getAdminDashboardApi = () => {
  return api.get("/api/admin/dashboard");
};

export const getAdminOnLeaveDetailsApi = () =>
  api.get("/api/admin/on-leave-details");

export const getAdminPendingReportsApi = () =>
  api.get("/api/admin/pending-reports");

export const getAdminEmployeesApi = () =>
  api.get("/api/admin/employees");
