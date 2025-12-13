import { api } from "@/lib/axios";

export const getMyLeavesApi = () => {
  return api.get("/api/leaves/me");
};

export const applyLeaveApi = (data: any) => {
  return api.post("/api/leaves", data);
};

export const cancelLeaveApi = (id: number) => {
  return api.post(`/api/leaves/${id}/status`, { status: "cancelled" });
};

export const getLeavesApi = () => {
  return api.get("/api/leaves"); // admin only
};

export const getLeaveHistory = () => {
  return api.get("/api/leave-history"); // admin only
};
export const updateLeaveStatusApi = (
  id: number,
  status: "approved" | "rejected"
) => {
  return api.post(`/api/leaves/${id}/status`, { status });
};

export const getApprovedLeavesApi = () => api.get("/api/leaves"); // employee gets only approved
