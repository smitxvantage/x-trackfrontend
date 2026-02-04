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

      setRecords(attendanceRes.data.data || []);
      setSummary(summaryRes.data.data || { present: 0, late: 0, absent: 0 });
    } catch (err) {
      console.error("Attendance load failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">My Attendance</h2>
        <p className="text-muted-foreground mt-1">Your attendance history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">

        {/* Calendar + Summary */}
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar selected={date} onSelect={setDate} />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <SummaryRow
                icon={<CalendarCheck className="h-4 w-4 text-green-500" />}
                label="Present Days"
                value={summary.present}
              />

              <SummaryRow
                icon={<Clock className="h-4 w-4 text-yellow-500" />}
                label="Late Arrivals"
                value={summary.late}
              />

              <SummaryRow
                icon={<XCircle className="h-4 w-4 text-red-500" />}
                label="Absences"
                value={summary.absent}
              />

            </CardContent>
          </Card>
        </div>

        {/* Attendance Log Table */}
        <div className="md:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Attendance Log</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
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
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}

                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.checkIn ?? "-"}</TableCell>
                      <TableCell>{r.checkOut ?? "-"}</TableCell>
                      <TableCell>{r.totalHours ?? "-"}</TableCell>
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
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-bold">{value}</span>
    </div>
  );
}
