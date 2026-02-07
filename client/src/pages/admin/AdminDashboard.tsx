import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  CalendarOff,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardApi, getAdminOnLeaveDetailsApi, getAdminPendingReportsApi, getAdminEmployeesApi } from "@/api/admin.api";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



export default function AdminDashboard() {
  // 🔹 1. ALL STATE HOOKS FIRST
  const [openOnLeave, setOpenOnLeave] = useState(false);
  const [openPendingReports, setOpenPendingReports] = useState(false);
  const [openEmployees, setOpenEmployees] = useState(false);

  // 🔹 2. ALL QUERIES NEXT
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await getAdminDashboardApi();
      return res.data?.data;
    },
  });

  const {
    data: onLeaveDetails,
    isLoading: isLeaveLoading,
  } = useQuery({
    queryKey: ["on-leave-details"],
    queryFn: async () => {
      const res = await getAdminOnLeaveDetailsApi();
      return res.data?.data;
    },
    enabled: openOnLeave,
  });

  const {
    data: pendingReportsList,
    isLoading: isPendingReportsLoading,
  } = useQuery({
    queryKey: ["pending-reports"],
    queryFn: async () => {
      const res = await getAdminPendingReportsApi();
      return res.data?.data;
    },
    enabled: openPendingReports,
  });

  const {
    data: employees,
    isLoading: isEmployeesLoading,
  } = useQuery({
    queryKey: ["admin-employees"],
    queryFn: async () => {
      const res = await getAdminEmployeesApi();
      return res.data?.data;
    },
    enabled: openEmployees,
  });

  // 🔹 3. ONLY NOW you can return conditionally
  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (isError || !data || !data.stats) {
    return <div className="p-6">Failed to load dashboard</div>;
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Overview of company performance and attendance.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Download Report</Button>
          <Button>View Analytics</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          onClick={() => setOpenEmployees(true)}
          className="cursor-pointer hover:shadow-md transition"
        >

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.stats?.totalEmployees ?? 0}

            </div>

            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1"><ArrowUpRight className="h-3 w-3" /> +4%</span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Time Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.onTimeToday}
            </div>

            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1"><ArrowUpRight className="h-3 w-3" /> 92%</span>
              arrival rate
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setOpenOnLeave(true)}
          className="cursor-pointer hover:shadow-md transition"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <CalendarOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.onLeaveToday}
            </div>


            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-muted-foreground flex items-center mr-1">4 approved</span>
              pending approval
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setOpenPendingReports(true)}
          className="cursor-pointer hover:shadow-md transition"
        >

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.pendingReports}
            </div>

            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-red-500 flex items-center mr-1"><ArrowDownRight className="h-3 w-3" /> -2</span>
              from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Work Hours</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyWorkHours}>

                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4942E4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4942E4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#4942E4' }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#4942E4" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.attendanceOverview}>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="present" name="Present" fill="#4942E4" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Pending Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.pendingLeaves.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{item.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.leaveType} • {item.startDate} – {item.endDate}
                    </p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Daily Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentReports.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 p-3 border-b last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{item.userName}</p>
                    <p className="text-xs text-muted-foreground break-all whitespace-pre-wrap">
                      {item.tasks}
                    </p>
                  </div>

                  <span className="text-sm whitespace-nowrap">
                    {item.hoursSpent ? `${item.hoursSpent}m` : "—"}
                  </span>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>
      </div>
      <Dialog open={openOnLeave} onOpenChange={setOpenOnLeave}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Employees On Leave Today</DialogTitle>
          </DialogHeader>

          {isLeaveLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-3">
              {onLeaveDetails?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.leaveType} • {item.reason || "No reason"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.startDate} → {item.endDate}
                    </p>
                  </div>

                  <Badge>{item.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openPendingReports} onOpenChange={setOpenPendingReports}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pending Daily Reports</DialogTitle>
          </DialogHeader>

          {isPendingReportsLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-3">
              {pendingReportsList?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-3 border rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.userName}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {item.tasks}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.hoursSpent ? `${item.hoursSpent} min` : "—"} •{" "}
                      {item.date}
                    </p>
                  </div>

                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openEmployees} onOpenChange={setOpenEmployees}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>All Employees</DialogTitle>
          </DialogHeader>

          {isEmployeesLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-3">
              {employees?.map((emp: any) => (
                <div
                  key={emp.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{emp.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {emp.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={emp.isActive ? "default" : "secondary"}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {emp.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
