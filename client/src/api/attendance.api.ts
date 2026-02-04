import { api } from "@/lib/axios";

export const getMyAttendanceApi = () =>
  api.get("/api/attendance/me");

export const getMySummaryApi = () =>
  api.get("/api/attendance/my-summary");

export const checkInApi = () =>
  api.post("/api/attendance/check-in");

export const checkOutApi = () =>
  api.post("/api/attendance/check-out");

// ✅ Missing API — now added
export const getAllAttendanceApi = () =>
  api.get("/api/attendance");
