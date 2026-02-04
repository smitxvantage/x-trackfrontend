import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  checkInApi,
  checkOutApi,
  getMyAttendanceApi,
  getMySummaryApi
} from "@/api/attendance.api";

import { getApprovedLeavesApi } from "@/api/leaves.api";
import { getHolidaysApi } from "@/api/holidays.api";
import { getMyReportsApi } from "@/api/dailyReports.api";
import { getMeApi } from "@/api/auth.api";

import { Clock, CalendarCheck, FileText, Coffee, Play, Square, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export default function EmployeeDashboard() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [user, setUser] = useState<any>(null);
  const [todayHours, setTodayHours] = useState("0h 00m");

  const [summary, setSummary] = useState({ present: 0, late: 0, absent: 0 });
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [pendingReports, setPendingReports] = useState(0);

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [
        userRes,
        attendanceRes,
        summaryRes,
        holidaysRes,
        leavesRes,
        reportsRes
      ] = await Promise.all([
        getMeApi(),
        getMyAttendanceApi(),
        getMySummaryApi(),
        getHolidaysApi(),
        getApprovedLeavesApi(),
        getMyReportsApi(),
      ]);

      setUser(userRes.data.data);

      const today = new Date().toISOString().split("T")[0];

      // FIND TODAY'S ATTENDANCE
      const todayRecord = attendanceRes.data.data.find(
        (a: any) => a.date.startsWith(today)
      );

      if (todayRecord) {
        if (todayRecord.checkIn && !todayRecord.checkOut) {
          setIsCheckedIn(true);
          setCheckInTime(new Date(`${today}T${todayRecord.checkIn}:00`));
        }

        if (todayRecord.checkIn && todayRecord.checkOut) {
          setIsCheckedIn(false);
          setCheckInTime(null);

          // Calculate hours
          const start = new Date(`${today}T${todayRecord.checkIn}:00`);
          const end = new Date(`${today}T${todayRecord.checkOut}:00`);
          const diffMs = end.getTime() - start.getTime();
          const diffMinutes = Math.floor(diffMs / 60000);
          const h = Math.floor(diffMinutes / 60);
          const m = diffMinutes % 60;

          setTodayHours(`${h}h ${m}m`);
        }
      }

      // Attendance Summary
      setSummary(summaryRes.data.data);

      // Leaves
      setLeaves(leavesRes.data.data);

      // Holidays
      setHolidays(holidaysRes.data.data);

      // Pending Reports
      const pending = reportsRes.data.data.filter((r: any) => r.status === "submitted");
      setPendingReports(pending.length);

      // Recent Activity
      const activity = [];

      if (todayRecord?.checkOut) {
        activity.push({
          title: "Checked Out",
          time: "Today",
          icon: "logout"
        });
      }

      if (todayRecord?.checkIn) {
        activity.push({
          title: "Checked In",
          time: "Today",
          icon: "login"
        });
      }

      if (pending.length > 0) {
        activity.push({
          title: "Daily Report Submitted",
          time: "Today",
          icon: "file"
        });
      }

      if (leavesRes.data.data.length > 0) {
        activity.push({
          title: "Leave Approved",
          time: leavesRes.data.data[0].startDate,
          icon: "check"
        });
      }

      setRecentActivity(activity);

    } catch (err) {
      console.log(err);
    }
  };

  // UPDATE TIMER WHEN CHECKED IN
  useEffect(() => {
    let interval: any;

    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.floor((now - checkInTime.getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  const formatSessionTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCheckIn = async () => {
    try {
      await checkInApi();
      setIsCheckedIn(true);
      setCheckInTime(new Date());
      toast({ title: "Checked in successfully!" });
    } catch {
      toast({ title: "Check-in failed", variant: "destructive" });
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutApi();
      setIsCheckedIn(false);
      setCheckInTime(null);
      setElapsedTime(0);
      toast({ title: "Checked out successfully!" });
      loadDashboard();
    } catch {
      toast({ title: "Check-out failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">

      {/* TOP HEADER */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM do yyyy")}
        </p>
      </div>

      {/* SESSION TIMER CARD */}
      <Card className="w-full md:w-fit ml-auto bg-primary text-white shadow-md">
        <CardContent className="p-4 flex items-center gap-8">

          <div>
            <p className="text-sm opacity-70">Current Session</p>
            <p className="text-3xl font-mono">{formatSessionTime(elapsedTime)}</p>
          </div>

          {isCheckedIn ? (
            <Button
              onClick={handleCheckOut}
              className="bg-white text-primary font-semibold"
            >
              <Square className="h-4 w-4 mr-2" /> Check Out
            </Button>
          ) : (
            <Button
              onClick={handleCheckIn}
              className="bg-white text-primary font-semibold"
            >
              <Play className="h-4 w-4 mr-2" /> Check In
            </Button>
          )}
        </CardContent>
      </Card>


      {/* METRIC CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        {/* WORK HOURS */}
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Work Hours Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayHours}</p>
            <Progress value={50} className="h-2 mt-2" />
            <p className="text-muted-foreground text-xs mt-1">Target: 8h 00m</p>
          </CardContent>
        </Card>

        {/* LEAVE BALANCE */}
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12 Days</p>
            <p className="text-muted-foreground text-xs">8 Casual, 4 Sick</p>
          </CardContent>
        </Card>

        {/* ATTENDANCE RATE */}
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary.present + summary.late > 0
                ? Math.round((summary.present / (summary.present + summary.late)) * 100)
                : 0}%
            </p>
            <p className="text-green-600 text-xs">Excellent attendance!</p>
          </CardContent>
        </Card>

        {/* PENDING REPORTS */}
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingReports}</p>
            <Button variant="link" className="px-0 text-primary text-xs">
              Complete now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* HOLIDAYS + RECENT ACTIVITY */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* UPCOMING HOLIDAYS */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
          </CardHeader>

          <CardContent>
            {holidays.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between p-3 border rounded-lg mb-3">
                <div>
                  <p className="font-semibold">{h.name}</p>
                  <p className="text-sm text-muted-foreground">{h.date}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  Public Holiday
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RECENT ACTIVITY */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
