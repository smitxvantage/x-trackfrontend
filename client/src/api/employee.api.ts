import { api } from "@/lib/axios";


export const getEmployeeDashboardApi = () =>
  api.get("/api/employee/dashboard");