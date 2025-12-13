import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { useQuery } from "@tanstack/react-query";
import { getAllAttendanceApi } from "@/api/attendance.api";

// Format decimal hours into "Hh Mm"
const formatHours = (decimal: number) => {
  const h = Math.floor(decimal);
  const m = Math.round((decimal % 1) * 60);
  return `${h}h ${m}m`;
};

export default function AttendanceList() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [search, setSearch] = useState("");

  // Fetch merged daily attendance from backend
  const { data, isLoading } = useQuery({
    queryKey: ["admin-attendance"],
    queryFn: async () => (await getAllAttendanceApi()).data.data,
  });

  // Filter attendance by search + date
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((record: any) => {
      const employeeName = record.userName
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesDate = date
        ? record.date === format(date, "yyyy-MM-dd")
        : true;

      return employeeName && matchesDate;
    });
  }, [data, search, date]);
  console.log(filteredData, " filteredData");
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground mt-1">
            Track employee check-ins and work hours.
          </p>
        </div>

        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* SEARCH + DATE FILTER */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border">
        <div className="flex-1">
          <Input
            placeholder="Search employee..."
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {/* DATE PICKER */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="rounded-md border bg-card">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading attendance...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((record: any) => (
                <TableRow key={record.userId + record.date}>
                  <TableCell className="font-medium">
                    {record.userName || `User #${record.userId}`}
                  </TableCell>

                  <TableCell>{record.date}</TableCell>

                  <TableCell>{record.firstCheckIn || "-"}</TableCell>
                  <TableCell>{record.lastCheckOut || "-"}</TableCell>

                  <TableCell>
                    {formatHours(Number(record.totalHours))}
                  </TableCell>

                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {record.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground h-24"
                  >
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
