import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  getMyAttendanceApi,
  getWeeklyHoursApi,
  checkInApi,
  checkOutApi,
} from "@/api/attendance.api";

import { getMeApi } from "@/api/auth.api";
import { Play, Square } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);

  const [loading, setLoading] = useState(false);

  // ===============================
  // LOAD DASHBOARD (SOURCE OF TRUTH)
  // ===============================
  const loadDashboard = async () => {
    try {
      const [userRes, attendanceRes, weeklyRes] = await Promise.all([
        getMeApi(),
        getMyAttendanceApi(),
        getWeeklyHoursApi(),
      ]);

      setUser(userRes.data.data);

      const today = new Date().toISOString().split("T")[0];

const sessions = attendanceRes.data.data.filter(
  (s: any) => s.date.startsWith(today)
);


      let totalMin = 0;
      let openSession: any = null;

      for (const s of sessions) {
        if (s.totalHours) {
          totalMin += Math.round(s.totalHours * 60);
        }
        if (!s.checkOut) {
          openSession = s;
        }
      }

      setTodayMinutes(totalMin);

      if (openSession) {
        const [h, m] = openSession.checkIn.split(":");
        const start = new Date();
        start.setHours(Number(h), Number(m), 0);

        setIsCheckedIn(true);
        setCheckInTime(start);
        setElapsedSeconds(
          Math.floor((Date.now() - start.getTime()) / 1000)
        );
      } else {
        setIsCheckedIn(false);
        setCheckInTime(null);
        setElapsedSeconds(0);
      }

      setWeeklyMinutes(
        Math.round(weeklyRes.data.data.weeklyHours * 60)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    loadDashboard();
  }, []);

  // ===============================
  // LIVE TIMER (THIS WAS MISSING BEFORE)
  // ===============================
  useEffect(() => {
    if (!isCheckedIn || !checkInTime) return;

    const interval = setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - checkInTime.getTime()) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  // ===============================
  // HELPERS
  // ===============================
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatMinutes = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  };

  // ===============================
  // ACTIONS
  // ===============================
  const handleCheckIn = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await checkInApi();
      toast({ title: "Checked in successfully" });
      await loadDashboard();
    } catch (err: any) {
      toast({
        title: err?.response?.data?.message || "Check-in failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await checkOutApi();
      toast({ title: "Checked out successfully" });
      await loadDashboard();
    } catch (err: any) {
      toast({
        title: err?.response?.data?.message || "Check-out failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold">
          Welcome back, {user?.name}
        </h2>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM do yyyy")}
        </p>
      </div>

      {/* SESSION CARD */}
      <Card className="w-full md:w-fit ml-auto bg-primary text-white">
        <CardContent className="p-4 flex items-center gap-8">
          <div>
            <p className="text-sm opacity-70">Current Session</p>
            <p className="text-3xl font-mono">
              {formatTime(elapsedSeconds)}
            </p>

            <p className="text-sm opacity-70 mt-2">Today Total</p>
            <p className="text-lg font-semibold">
              {formatMinutes(todayMinutes)}
            </p>
          </div>

          {isCheckedIn ? (
            <Button
              onClick={handleCheckOut}
              disabled={loading}
              className="bg-white text-primary"
            >
              <Square className="h-4 w-4 mr-2" /> Check Out
            </Button>
          ) : (
            <Button
              onClick={handleCheckIn}
              disabled={loading}
              className="bg-white text-primary"
            >
              <Play className="h-4 w-4 mr-2" /> Check In
            </Button>
          )}
        </CardContent>
      </Card>

      {/* METRICS */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatMinutes(todayMinutes)}
            </p>
            <Progress
              value={Math.min((todayMinutes / 480) * 100, 100)}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatMinutes(weeklyMinutes)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
