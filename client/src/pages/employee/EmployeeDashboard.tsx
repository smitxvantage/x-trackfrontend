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

const useSessionTimer = (session: {
  checkInAt: string;
  totalPausedSeconds: number;
  isPaused: boolean;
} | null) => {
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!session || session.isPaused) return;

    const i = setInterval(() => {
      forceTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(i);
  }, [session?.checkInAt, session?.isPaused]);

  if (!session) return 0;

  const start = new Date(session.checkInAt).getTime();
  const now = Date.now();
  const paused = Number(session.totalPausedSeconds || 0);

  return Math.max(
    Math.floor((now - start) / 1000) - paused,
    0
  );
};



export default function EmployeeDashboard() {
  const [activeSession, setActiveSession] = useState<{
    checkInAt: string;
    totalPausedSeconds: number;
    isPaused: boolean;
  } | null>(null);

  const hasActiveSession =
    activeSession !== null &&
    typeof activeSession.checkInAt === "string";



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

  const elapsedSeconds = useSessionTimer(activeSession);



  const [leaveStats, setLeaveStats] = useState({
    total: 0,
    casual: 0,
    sick: 0,
  });




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
      const attendanceData = attendanceRes.data.data;

      const session = attendanceData?.activeSession ?? null;
      setActiveSession(session);





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

      const todayCompleted = records.find(
        (r: any) => r.date === today && r.checkIn && r.checkOut
      );

      if (todayCompleted) {
        const [sh, sm] = todayCompleted.checkIn.split(":").map(Number);
        const [eh, em] = todayCompleted.checkOut.split(":").map(Number);

        const start = new Date(0, 0, 0, sh, sm);
        const end = new Date(0, 0, 0, eh, em);

        const diffMinutes = Math.floor(
          (end.getTime() - start.getTime()) / 60000
        );

        const h = Math.floor(diffMinutes / 60);
        const m = diffMinutes % 60;

        setTodayHours(`${h}h ${m}m`);
        setWorkProgress(Math.min((diffMinutes / 480) * 100, 100));
      } else {
        setTodayHours("0h 00m");
        setWorkProgress(0);
      }


      if (todayCompleted) {
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
      const res = await checkInApi();

      if (!res?.data?.success) {
        throw new Error("Check-in API failed");
      }

      const { checkInAt, isPaused, totalPausedSeconds } = res.data.data;

      setActiveSession({
        checkInAt,
        isPaused,
        totalPausedSeconds,
      });


      toast({ title: "Checked in successfully!" });
    } catch (err) {
      console.error("Check-in error:", err);
      toast({ title: "Check-in failed", variant: "destructive" });
    }
  };



  const handleCheckOut = async () => {
    try {
      await checkOutApi();

      setActiveSession(null);

      toast({ title: "Checked out successfully!" });
      loadDashboard();
    } catch {
      toast({ title: "Check-out failed", variant: "destructive" });
    }
  };

  const handlePause = async () => {
    try {
      await pauseApi();

      setActiveSession((s) =>
        s ? { ...s, isPaused: true } : s
      );

      toast({ title: "Session paused" });
    } catch {
      toast({ title: "Pause failed", variant: "destructive" });
    }
  };




  const handleResume = async () => {
    try {
      await resumeApi();

      const attendanceRes = await getMyAttendanceApi();
      const session = attendanceRes.data.data.activeSession;

      if (!session) return;

      setActiveSession(session);

      toast({ title: "Session resumed" });
    } catch {
      toast({ title: "Resume failed", variant: "destructive" });
    }
  };


  const getLiveWorkTime = () => {
    const totalMinutes = Math.floor(elapsedSeconds / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return {
      label: `${h}h ${m.toString().padStart(2, "0")}m`,
      progress: Math.min((totalMinutes / 480) * 100, 100),
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
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Work Hours Today</CardTitle>
          </CardHeader>
          <CardContent>
            {hasActiveSession ? (
              (() => {
                const live = getLiveWorkTime();
                return (
                  <>
                    <p className="text-2xl font-bold">{live.label}</p>
                    <Progress value={live.progress} className="h-2 mt-2" />
                  </>
                );
              })()
            ) : (
              <>
                <p className="text-2xl font-bold">{todayHours}</p>
                <Progress value={workProgress} className="h-2 mt-2" />
              </>
            )}

            <p className="text-muted-foreground text-xs mt-1">Target: 8h 00m</p>
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
