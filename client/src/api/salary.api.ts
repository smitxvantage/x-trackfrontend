import { api } from "@/lib/axios";

export const getEmployeesApi = () => {
  return api.get("/api/getemployee");
};

export const createEmployeeApi = (data: any) => {
  return api.post("/api/create", data);
};

export const getSalaryApi = (year: number, month: number) => {
  return api.get(`/api/salary/calculate`, {
    params: { year, month },
  });
};