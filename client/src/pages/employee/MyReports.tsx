import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Plus, Clock } from "lucide-react";

import {
  getMyReportsApi,
  createReportApi,
  updateReportApi,
} from "@/api/dailyReports.api";
import { getMyAttendanceApi } from "@/api/attendance.api";

import { toast } from "@/hooks/use-toast";

export default function MyReports() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [reports, setReports] = useState([]);

  const [summary, setSummary] = useState("");
  const [blockers, setBlockers] = useState("");

  const todayDate = new Date().toISOString().split("T")[0];
  const [todayHours, setTodayHours] = useState<number | null>(null);

  const [task, setTask] = useState("");
  const [estHours, setEstHours] = useState<number | "">("");
  const [estMinutes, setEstMinutes] = useState<number | "">("");
  const [admin, setAdmin] = useState("");


  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedReports, setSelectedReports] = useState<any[]>([]);

  // edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any | null>(null);

  // edit form fields
  const [editTask, setEditTask] = useState("");
  const [editHours, setEditHours] = useState<number | "">("");
  const [editMinutes, setEditMinutes] = useState<number | "">("");
  const [editAdmin, setEditAdmin] = useState("");

  const handleUpdateReport = async () => {
    const hours = typeof editHours === "number" ? editHours : 0;
    const minutes = typeof editMinutes === "number" ? editMinutes : 0;

    const totalMinutes = hours * 60 + minutes;


    if (!editTask || totalMinutes === 0) {
      toast({
        title: "Task and Estimated Time are required",
        variant: "destructive"
      });
      return;
    }

    const updatedTasks = editTask;


    try {
      await updateReportApi(editingReport.id, {
        tasks: editTask,
        hoursSpent: totalMinutes,
        admin: editAdmin && editAdmin !== "-" ? editAdmin : undefined,
      });


      toast({ title: "Report updated successfully" });

      // refresh data
      loadReports();

      setIsEditOpen(false);
      setIsViewOpen(false);
    } catch (err) {
      toast({
        title: "Failed to update report",
        variant: "destructive",
      });
    }
  };

  const parseEstimatedTimeToMinutes = (value?: string) => {
    if (!value) return 0;

    // supports: "2h", "2h 30m", "45m", "2.5h"
    let minutes = 0;

    const hourMatch = value.match(/(\d+(\.\d+)?)\s*h/);
    const minMatch = value.match(/(\d+)\s*m/);

    if (hourMatch) {
      minutes += Math.round(parseFloat(hourMatch[1]) * 60);
    }

    if (minMatch) {
      minutes += parseInt(minMatch[1]);
    }

    return minutes;
  };

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  // Convert decimal hours → "Hh MMm"
  const formatHoursUI = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  // -------------------------------------
  // LOAD TODAY ATTENDANCE
  // -------------------------------------
  const loadTodayAttendance = async () => {
    try {
      const res = await getMyAttendanceApi();
      const records = res.data.data;

      const todayRecord = records.find((r: any) =>
        r.date.startsWith(todayDate)
      );

      if (!todayRecord || !todayRecord.checkIn || !todayRecord.checkOut) {
        setTodayHours(null);
        return;
      }

      // totalHours comes as decimal from DB (e.g. 0.50 = 30 min)
      const decimalHours = Number(todayRecord.totalHours);

      setTodayHours(Math.round(decimalHours * 60));

    } catch (err) {
      console.error("Failed loading attendance", err);
    }
  };

  // -------------------------------------
  // LOAD REPORTS
  // -------------------------------------
  const loadReports = async () => {
    try {
      const res = await getMyReportsApi();
      setReports(res.data.data);
    } catch (err) {
      toast({ title: "Failed to load reports", variant: "destructive" });
    }
  };

  // -------------------------------------
  // SUBMIT REPORT
  // -------------------------------------
  const submitReport = async () => {
    // if (todayHours === null) {
    //   toast({
    //     title: "Please check-out before submitting a report",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    if (!task) {
      toast({
        title: "Task is required",
        variant: "destructive"
      });
      return;
    }


    const totalEstimatedMinutes =
      (Number(estHours) || 0) * 60 + (Number(estMinutes) || 0);

    if (totalEstimatedMinutes === 0) {
      toast({
        title: "Estimated time is required",
        variant: "destructive"
      });
      return;
    }

    const estimatedTimeString = `${Math.floor(totalEstimatedMinutes / 60)}h ${totalEstimatedMinutes % 60}m`;


    try {
      await createReportApi({
        date: todayDate,
        hoursWorked: todayHours ?? 0, // ✅ fallback
        tasks: task,
        hoursSpent: totalEstimatedMinutes,
        admin: admin,
        blockers: blockers || null
      });

      toast({ title: "Report submitted successfully" });
      setIsAddOpen(false);

      loadReports(); // refresh list

      // reset form
      setTask("");
      setEstHours("");
      setEstMinutes("");

      setAdmin("");

      setBlockers("");

    } catch (err) {
      console.error(err);
      toast({ title: "Failed to submit report", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadReports();
    loadTodayAttendance();
  }, []);

  const selectedDayTotalMinutes = selectedReports.reduce(
    (sum, report) => sum + (report.hoursSpent || 0),
    0
  );



  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daily Reports</h2>
          <p className="text-muted-foreground mt-1">
            Submit and track your daily work reports.
          </p>
        </div>

        {/* NEW REPORT DIALOG */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Report
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Submit Daily Report</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">

              {/* AUTO HOURS */}
              <div className="space-y-2">
                <Label>Today's Work Hours</Label>
                <Input
                  disabled
                  className="bg-muted"
                  value={todayHours !== null ? formatHoursUI(todayHours) : ""}
                />

              </div>

              {/* SUMMARY */}
              <div className="space-y-4">
                <Label>Work Summary</Label>

                <Input
                  placeholder="Task"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                />

                <div className="space-y-2">
                  <Label>Estimated Time</Label>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Hours"
                      value={estHours}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEstHours(val === "" ? "" : Math.max(0, Number(val)));
                      }}
                    />

                    <Input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="Minutes"
                      value={estMinutes}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          setEstMinutes("");
                        } else {
                          const num = Number(value);
                          setEstMinutes(num > 59 ? 59 : num);
                        }
                      }}
                    />
                  </div>
                </div>


                <Input
                  placeholder="Admin"
                  value={admin}
                  onChange={(e) => setAdmin(e.target.value)}
                />
              </div>


              {/* BLOCKERS */}
              <div className="space-y-2">
                <Label>Blockers (Optional)</Label>
                <Input
                  value={blockers}
                  onChange={e => setBlockers(e.target.value)}
                  placeholder="Any issues?"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitReport}>Submit Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* REPORT CARDS */}
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(
          reports.reduce((acc: any, report: any) => {
            const dateKey = new Date(report.date).toLocaleDateString();

            acc[dateKey] = acc[dateKey] || [];
            acc[dateKey].push(report);

            return acc;
          }, {})
        ).map(([date, dayReports]: any) => (
          <Card
            key={date}
            onClick={() => {
              setSelectedDate(date);
              setSelectedReports(dayReports);
              setIsViewOpen(true);
            }}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{date}</CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              {dayReports.length} reports
            </CardContent>
          </Card>

        ))}
      </div>


      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reports – {selectedDate}</DialogTitle>
          </DialogHeader>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Task</th>
                  <th className="text-left p-2">Estimated Time</th>
                  <th className="text-left p-2">Admin</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Action</th>

                </tr>
              </thead>

              <tbody>
                {selectedReports.map((report) => {
                  const task = report.tasks;
                  const time = formatMinutes(report.hoursSpent || 0);
                  const admin = report.admin || "-";
                  return (
                    <tr key={report.id} className="border-b">
                      <td className="p-4 max-w-[420px] align-top">
                        <p
                          className="
                            text-sm text-foreground
                            leading-relaxed
                            line-clamp-3
                            hover:line-clamp-none
                            cursor-default
                          "
                          title={task}
                        >
                          {task}
                        </p>
                      </td>

                      <td className="p-2 whitespace-nowrap">
                        {time}
                      </td>
                      <td className="p-2 max-w-[150px] break-words whitespace-normal">
                        {admin}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {report.status}
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const minutes = report.hoursSpent || 0;


                            setEditingReport(report);
                            setEditTask(task || "");
                            setEditHours(Math.floor(minutes / 60));
                            setEditMinutes(minutes % 60);
                            setEditAdmin(report.admin || "");
                            setIsEditOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="border-t font-medium bg-muted/40">
                  <td className="p-2">Total</td>
                  <td className="p-2 whitespace-nowrap">
                    {formatMinutes(selectedDayTotalMinutes)}

                  </td>
                  <td />
                  <td />
                </tr>
              </tfoot>

            </table>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Task</Label>
              <Input
                value={editTask}
                onChange={(e) => setEditTask(e.target.value)}
              />
            </div>

            <div>
              <Label>Estimated Time</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Hours"
                  value={editHours}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      setEditHours("");
                    } else {
                      setEditHours(Number(value));
                    }
                  }}

                />
                <Input
                  type="number"
                  min={0}
                  max={59}
                  placeholder="Minutes"
                  value={editMinutes}
                  onChange={(e) => {
                    const raw = e.target.value;

                    if (raw === "") {
                      setEditMinutes("");
                    } else {
                      let v = Number(raw);
                      if (v > 59) v = 59;
                      setEditMinutes(v);
                    }

                  }}
                />
              </div>
            </div>

            <div>
              <Label>Admin</Label>
              <Input
                value={editAdmin}
                onChange={(e) => setEditAdmin(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateReport}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
