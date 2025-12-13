import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";

// Layouts
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import EmployeeList from "@/pages/admin/EmployeeList";
import AttendanceList from "@/pages/admin/AttendanceList";
import LeaveManagement from "@/pages/admin/LeaveManagement";
import ReportsManagement from "@/pages/admin/ReportsManagement";
import HolidayManagement from "@/pages/admin/HolidayManagement";
import Settings from "@/pages/admin/Settings";

// Employee Pages
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import EmployeeCalendar from "@/pages/employee/EmployeeCalendar";
import MyAttendance from "@/pages/employee/MyAttendance";
import MyReports from "@/pages/employee/MyReports";
import MyLeaves from "@/pages/employee/MyLeaves";
import Profile from "@/pages/employee/Profile";
import SalaryManagement from "./pages/admin/SalaryManagement";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      
      {/* Root Redirect */}
      <Route path="/">
        <Redirect to="/login" />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/:rest*">
        <AdminLayout>
          <Switch>
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/employees" component={EmployeeList} />
            <Route path="/admin/attendance" component={AttendanceList} />
            <Route path="/admin/leaves" component={LeaveManagement} />
            <Route path="/admin/reports" component={ReportsManagement} />
            <Route path="/admin/holidays" component={HolidayManagement} />
            <Route path="/admin/settings" component={Settings} />
             <Route path="/admin/salary" component={SalaryManagement} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>

      {/* Employee Routes */}
      <Route path="/employee/:rest*">
        <EmployeeLayout>
          <Switch>
            <Route path="/employee/dashboard" component={EmployeeDashboard} />
            <Route path="/employee/calendar" component={EmployeeCalendar} />
            <Route path="/employee/attendance" component={MyAttendance} />
            <Route path="/employee/reports" component={MyReports} />
            <Route path="/employee/leaves" component={MyLeaves} />
            <Route path="/employee/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </EmployeeLayout>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
