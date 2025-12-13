import React, { useState, useEffect } from "react";
import axios from "axios";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { getLeaveHistory } from "@/api/leaves.api";
interface LeaveRecord {
  id: number;
  userId: number;
  name: string;
  email: string;
  month: string;
  appliedLeaves: number;
  paidLeaves: number;
  unpaidLeaves: number;
  createdAt: string;
  remainingEarnedLeave: number;
}

export default function EmployeeLeaveOverview() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [leaveData, setLeaveData] = useState<LeaveRecord[]>([]);
  const [filteredData, setFilteredData] = useState<LeaveRecord[]>([]);

  const getFormattedMonth = (date: Date | null) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const formattedMonth = getFormattedMonth(selectedDate);

  async function fetchLeaves() {
    try {
      const res = await getLeaveHistory();
      setLeaveData(res.data.data || []);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load leave requests" });
    }
  }
 const applyFilter = () => {
    const monthData = leaveData.filter((item) => item.month === formattedMonth);

    const grouped: any = Object.values(
      monthData.reduce((acc: any, curr: LeaveRecord) => {
        const userId = curr.userId;

        if (!acc[userId]) {
          acc[userId] = {
            ...curr,
            appliedLeaves: Number(curr.appliedLeaves),
            paidLeaves: Number(curr.paidLeaves),
            unpaidLeaves: Number(curr.unpaidLeaves),
          };
        } else {
          acc[userId].appliedLeaves += Number(curr.appliedLeaves);
          acc[userId].paidLeaves += Number(curr.paidLeaves);
          acc[userId].unpaidLeaves += Number(curr.unpaidLeaves);
        }

        return acc;
      }, {})
    );

    setFilteredData(grouped);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [selectedDate, leaveData]);

  return (
    <div className="my-10">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Employee Leave Summary
          </h2>
          <p className="text-muted-foreground mt-1">
            Quick overview of each employee’s leave balance and usage.
          </p>
        </div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={["year", "month"]}
            label="Select Month"
            minDate={new Date("2020-01-01")}
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
          />
        </LocalizationProvider>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Unpaid</TableHead>
              <TableHead>Remaining Earned Leave</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((request: any) => (
              <TableRow key={request.id}>
                <TableCell className="capitalize">{request.name}</TableCell>
                <TableCell>{request.appliedLeaves}</TableCell>
                <TableCell>{request.paidLeaves}</TableCell>
                <TableCell>{request.unpaidLeaves}</TableCell>
                <TableCell>{request.remainingEarnedLeave}</TableCell>
              </TableRow>
            ))}

            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground h-24"
                >
                  No pending requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
