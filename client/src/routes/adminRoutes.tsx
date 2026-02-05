import { RouteObject } from "react-router-dom";

import AdminLayout from "@/components/layout/AdminLayout";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AttendanceList from "@/pages/admin/AttendanceList";
import ReportsManagement from "@/pages/admin/ReportsManagement";
import EmployeeList from "@/pages/admin/EmployeeList";
import EmployeeDailyOverview from "@/pages/admin/EmployeeDailyOverview";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "attendance",
        element: <AttendanceList />,
      },
      {
        path: "reports",
        element: <ReportsManagement />,
      },
      {
        path: "employees",
        element: <EmployeeList />,
      },
      {
        path: "daily-overview",
        element: <EmployeeDailyOverview />,
      },
    ],
  },
];
