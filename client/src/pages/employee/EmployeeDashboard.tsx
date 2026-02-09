import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  checkInApi,
  checkOutApi,
  getMyAttendanceApi,
  getMySummaryApi,
  pauseApi,
  resumeApi,
} from "@/api/attendance.api";

import { getApprovedLeavesApi } from "@/api/leaves.api";
import { getHolidaysApi } from "@/api/holidays.api";
import { getMyReportsApi } from "@/api/dailyReports.api";
import { getMeApi } from "@/api/auth.api";

import { Clock, CalendarCheck, FileText, Coffee, Play, Square, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";


type Holiday = {
  id: number;
  name: string;
  date: string;
};

type RecentActivityItem = {
  title: string;
  time: string;
  icon?: string;
};

const TIMER_RUNNING_KEY = "attendance_timer_running";
const SESSION_START_KEY = "attendance_session_start";
const PAUSED_TOTAL_KEY = "attendance_paused_total";
const PAUSED_AT_KEY = "attendance_paused_at";

const DAILY_TARGET_MINUTES = 8 * 60 + 30; // 510 minutes




export default function EmployeeDashboard() {
  const [activeSession, setActiveSession] = useState<{
    checkInAt: string;
    totalPausedSeconds: number;
    isPaused: boolean;
  } | null>(null);

  const hasActiveSession =
    activeSession !== null &&
    typeof activeSession.checkInAt === "string";


  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [todayHours, setTodayHours] = useState("0h 00m");

  const [summary, setSummary] = useState({ present: 0, late: 0, absent: 0 });
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leaves, setLeaves] = useState([]);
  const [pendingReports, setPendingReports] = useState(0);

  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [workProgress, setWorkProgress] = useState(0);

  const navigate = useNavigate();

  const pausedSeconds = activeSession?.totalPausedSeconds ?? 0;

  const pausedMinutes = Math.floor(pausedSeconds / 60);
  const pausedRemainingSeconds = pausedSeconds % 60;

  const pausedTime = `${pausedMinutes} min ${pausedRemainingSeconds} sec`;

  const [todayCompletedMinutes, setTodayCompletedMinutes] = useState(0);



  const [leaveStats, setLeaveStats] = useState({
    total: 0,
    casual: 0,
    sick: 0,
  });

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const start = Number(localStorage.getItem(SESSION_START_KEY));
      const pausedTotal = Number(localStorage.getItem(PAUSED_TOTAL_KEY)) || 0;
      const pausedAt = Number(localStorage.getItem(PAUSED_AT_KEY));

      if (!start) return;

      let pausedExtra = 0;
      if (pausedAt) {
        pausedExtra = Math.floor((Date.now() - pausedAt) / 1000);
      }

      const seconds = Math.floor(
        (Date.now() - start) / 1000 - pausedTotal - pausedExtra
      );

      setElapsedSeconds(Math.max(seconds, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const running = localStorage.getItem(TIMER_RUNNING_KEY) === "true";
    if (running) {
      setIsRunning(true);
    }

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
      const attendanceData = attendanceRes.data.data;

      const session = attendanceData?.activeSession ?? null;
      setActiveSession(session);


      if (!session) {
        setIsRunning(false);
      }






      // Attendance Summary
      setSummary(summaryRes.data.data);

      // Leaves
      setLeaves(leavesRes.data.data);

      const casual = leavesRes.data.data.filter(
        (l: any) => l.leaveType === "casual"
      ).length;

      const sick = leavesRes.data.data.filter(
        (l: any) => l.leaveType === "sick"
      ).length;

      setLeaveStats({ total: casual + sick, casual, sick });


      // Holidays
      setHolidays(holidaysRes.data.data);

      // Pending Reports
      const pending = reportsRes.data.data.filter((r: any) => r.status === "submitted");
      setPendingReports(pending.length);

      // Recent Activity
      const activity: any[] = [];

      if (attendanceData.activeSession) {
        activity.push({ title: "Checked In", time: "Today" });
      }

      // -------- TODAY COMPLETED HOURS --------
      const records = attendanceData.records || [];

      const todayRecords = records.filter((r: any) => {
        const recordDate = new Date(r.date).toISOString().split("T")[0];
        return recordDate === today && r.checkIn && r.checkOut;
      });


      let totalMinutes = 0;

      todayRecords.forEach((r: any) => {
        const [sh, sm] = r.checkIn.split(":").map(Number);
        const [eh, em] = r.checkOut.split(":").map(Number);

        const start = new Date(0, 0, 0, sh, sm);
        const end = new Date(0, 0, 0, eh, em);

        const diff = Math.floor(
          (end.getTime() - start.getTime()) / 60000
        );

        totalMinutes += diff;
      });

      // ✅ store completed minutes (even if 0)
      setTodayCompletedMinutes(totalMinutes);

      // ✅ format display safely
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;

      setTodayHours(`${h}h ${m.toString().padStart(2, "0")}m`);




      if (todayRecords.length > 0) {
        activity.push({ title: "Checked Out", time: "Today" });
      }



      if (pending.length > 0) {
        activity.push({ title: "Daily Report Submitted", time: "Today" });
      }

      leavesRes.data.data.slice(0, 1).forEach((l: any) => {
        activity.push({
          title: "Leave Approved",
          time: new Date(l.startDate).toLocaleDateString(),
        });
      });

      setRecentActivity(activity);


    } catch (err) {
      console.log(err);
    }
  };


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

      const now = Date.now();

      localStorage.setItem(SESSION_START_KEY, String(now));
      localStorage.setItem(PAUSED_TOTAL_KEY, "0");
      localStorage.removeItem(PAUSED_AT_KEY);
      localStorage.setItem(TIMER_RUNNING_KEY, "true");

      setElapsedSeconds(0);
      setIsRunning(true);

      setActiveSession({
        checkInAt: new Date(now).toISOString(),
        isPaused: false,
        totalPausedSeconds: 0,
      });

      toast({ title: "Checked in successfully!" });
    } catch {
      toast({ title: "Check-in failed", variant: "destructive" });
    }
  };



  const handlePause = async () => {
    try {
      await pauseApi();

      localStorage.setItem(PAUSED_AT_KEY, String(Date.now()));
      localStorage.setItem(TIMER_RUNNING_KEY, "false");

      setIsRunning(false);
      setActiveSession(s => s ? { ...s, isPaused: true } : s);

      toast({ title: "Session paused" });
    } catch {
      toast({ title: "Pause failed", variant: "destructive" });
    }
  };






  const handleResume = async () => {
    try {
      await resumeApi();

      const pausedAt = Number(localStorage.getItem(PAUSED_AT_KEY));
      if (pausedAt) {
        const pausedSeconds = Math.floor((Date.now() - pausedAt) / 1000);
        const totalPaused =
          Number(localStorage.getItem(PAUSED_TOTAL_KEY)) || 0;

        localStorage.setItem(
          PAUSED_TOTAL_KEY,
          String(totalPaused + pausedSeconds)
        );
      }

      localStorage.removeItem(PAUSED_AT_KEY);
      localStorage.setItem(TIMER_RUNNING_KEY, "true");

      setIsRunning(true);
      setActiveSession(s => s ? { ...s, isPaused: false } : s);

      toast({ title: "Session resumed" });
    } catch {
      toast({ title: "Resume failed", variant: "destructive" });
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutApi();

      setIsRunning(false);
      setActiveSession(null);

      localStorage.removeItem(SESSION_START_KEY);
      localStorage.removeItem(PAUSED_TOTAL_KEY);
      localStorage.removeItem(PAUSED_AT_KEY);
      localStorage.removeItem(TIMER_RUNNING_KEY);

      toast({ title: "Checked out successfully!" });
      loadDashboard();
    } catch {
      toast({ title: "Check-out failed", variant: "destructive" });
    }
  };



  const getLiveWorkTime = () => {
    const totalMinutes = Math.floor(elapsedSeconds / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return {
      label: `${h}h ${m.toString().padStart(2, "0")}m`,
      progress: Math.min(
        (totalMinutes / DAILY_TARGET_MINUTES) * 100,
        100
      ),
    };
  };

  // ✅ PLACE THIS FUNCTION RIGHT HERE ⬇⬇⬇
  const getTotalWorkTimeToday = () => {
    const liveMinutes = hasActiveSession
      ? Math.floor(elapsedSeconds / 60)
      : 0;

    const totalMinutes = todayCompletedMinutes + liveMinutes;

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return {
      label: `${h}h ${m.toString().padStart(2, "0")}m`,
      progress: Math.min(
        (totalMinutes / DAILY_TARGET_MINUTES) * 100,
        100
      ),
    };
  };




  return (
    <div className="space-y-8">

      {/* TOP HEADER */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h2>

        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM do yyyy")}
        </p>
      </div>

      {/* SESSION TIMER CARD */}
      <Card className="w-full md:w-fit md:ml-auto bg-primary text-white shadow-md">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">

          <div>
            <p className="text-sm opacity-70">Current Session</p>
            <p className="text-3xl font-mono">
              {formatSessionTime(elapsedSeconds)}
            </p>

          </div>
          {activeSession?.totalPausedSeconds > 0 && (
            <p className="text-xs opacity-70 mt-1">
              Paused: {pausedTime}
            </p>
          )}


          {hasActiveSession ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {activeSession.isPaused ? (
                <Button onClick={handleResume} className="bg-white text-primary">
                  ▶ Resume
                </Button>
              ) : (
                <Button onClick={handlePause} className="bg-white text-primary">
                  ⏸ Pause
                </Button>
              )}

              <Button onClick={handleCheckOut} className="bg-white text-primary">
                ⏹ Check Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleCheckIn}
              className="bg-white text-primary font-semibold"
            >
              ▶ Check In
            </Button>
          )}


        </CardContent>
      </Card>


      {/* METRIC CARDS */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        {/* WORK HOURS */}
        {/* WORK HOURS TODAY */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Work Hours Today</CardTitle>
          </CardHeader>

          <CardContent>
            {(() => {
              const total = getTotalWorkTimeToday();

              return (
                <>
                  <p className="text-2xl font-bold">{total.label}</p>
                  <Progress value={total.progress} className="h-2 mt-2" />
                </>
              );
            })()}

            <p className="text-muted-foreground text-xs mt-1">
              Target: 8h 30m
            </p>
          </CardContent>
        </Card>


        {/* LEAVE BALANCE */}
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{leaveStats.total} Days</p>
            <p className="text-muted-foreground text-xs">
              {leaveStats.casual} Casual, {leaveStats.sick} Sick
            </p>

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
            <Button
              variant="link"
              className="px-0 text-primary text-xs"
              onClick={() => navigate("/employee/reports")}
            >
              Complete now
            </Button>

          </CardContent>
        </Card>
      </div>

      {/* HOLIDAYS + RECENT ACTIVITY */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">

        {/* UPCOMING HOLIDAYS */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
          </CardHeader>

          <CardContent>
            {holidays.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No upcoming holidays
              </p>
            )}

            {holidays.map((h: any) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-3 border rounded-lg mb-3"
              >
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
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>

        </Card>

      </div>
    </div>
  );
}
