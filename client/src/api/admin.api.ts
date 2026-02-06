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