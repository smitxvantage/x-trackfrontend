import { api } from "@/lib/axios";

// --------------------
// USER ATTENDANCE
// --------------------
export const getMyAttendanceApi = () =>
  api.get("/api/attendance/me");

export const getMySummaryApi = () =>
  api.get("/api/attendance/my-summary");

export const checkInApi = () =>
  api.post("/api/attendance/check-in");

export const checkOutApi = () =>
  api.post("/api/attendance/check-out");

// --------------------
// WEEKLY HOURS
// --------------------
export const getWeeklyHoursApi = () =>
  api.get("/api/attendance/weekly-hours");

// --------------------
// ADMIN
// --------------------
export const getAllAttendanceApi = () =>
  api.get("/api/attendance");
