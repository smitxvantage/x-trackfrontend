import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Clock, CalendarCheck, XCircle } from "lucide-react";

import { getMyAttendanceApi, getMySummaryApi } from "@/api/attendance.api";

export default function MyAttendance() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState({ present: 0, late: 0, absent: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendanceRes, summaryRes] = await Promise.all([
        getMyAttendanceApi(),
        getMySummaryApi()
      ]);

      setRecords(attendanceRes.data.data?.records || []);

      setSummary(summaryRes.data.data || { present: 0, late: 0, absent: 0 });
    } catch (err) {
      console.error("Attendance load failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">
          My Attendance
        </h2>

        <p className="text-muted-foreground mt-1">Your attendance history.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-12">

        {/* Calendar + Summary */}
        <div className="md:col-span-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary" />
                Attendance Calendar
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
              <div className="rounded-xl border bg-gradient-to-br from-background to-muted/40 p-3 shadow-sm">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full"
                  classNames={{
                    day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    day_today:
                      "border border-primary text-primary",
                    day_outside:
                      "text-muted-foreground opacity-40",
                    nav_button:
                      "hover:bg-accent hover:text-accent-foreground rounded-md",
                    caption:
                      "flex justify-center py-2 relative items-center text-sm font-semibold",
                  }}
                />
              </div>
            </CardContent>

          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <SummaryStat
                label="Present"
                value={summary.present}
                icon={<CalendarCheck className="h-5 w-5 text-green-600" />}
                bg="bg-green-50"
              />

              <SummaryStat
                label="Late"
                value={summary.late}
                icon={<Clock className="h-5 w-5 text-yellow-600" />}
                bg="bg-yellow-50"
              />

              <SummaryStat
                label="Absent"
                value={summary.absent}
                icon={<XCircle className="h-5 w-5 text-red-600" />}
                bg="bg-red-50"
              />
            </CardContent>

          </Card>
        </div>

        {/* Attendance Log Table */}
        {/* Attendance Log */}
        <div className="md:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Attendance Log</CardTitle>
            </CardHeader>

            <CardContent>
              {/* MOBILE VIEW */}
              <div className="block md:hidden space-y-4">
                {records.length === 0 && (
                  <p className="text-center text-muted-foreground py-6">
                    No attendance records found
                  </p>
                )}

                {[...records].reverse().map((r) => {
                  const total =
                    r.totalHours != null
                      ? (() => {
                        const totalMinutes = Math.round(Number(r.totalHours) * 60);
                        const h = Math.floor(totalMinutes / 60);
                        const m = totalMinutes % 60;
                        return `${h}h ${m}m`;
                      })()
                      : "-";

                  return (
                    <div
                      key={r.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{r.date}</span>
                        <Badge
                          variant="outline"
                          className={
                            r.status === "on-time"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {r.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Check In</p>
                          <p>{r.checkIn ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Check Out</p>
                          <p>{r.checkOut ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p>{total}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE — YOUR EXISTING CODE */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="text-xs uppercase tracking-wide text-muted-foreground">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {records.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    )}

                    {[...records].reverse().map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.checkIn ?? "-"}</TableCell>
                        <TableCell>{r.checkOut ?? "-"}</TableCell>
                        <TableCell>
                          {r.totalHours != null
                            ? (() => {
                              const totalMinutes = Math.round(
                                Number(r.totalHours) * 60
                              );
                              const h = Math.floor(totalMinutes / 60);
                              const m = totalMinutes % 60;
                              return `${h} hours ${m} minutes`;
                            })()
                            : "-"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              r.status === "on-time"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}

function SummaryStat({ icon, label, value, bg }: any) {
  return (
    <div className={`rounded-lg p-3 ${bg} border`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}