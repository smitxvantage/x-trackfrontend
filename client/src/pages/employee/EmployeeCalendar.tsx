import { useEffect, useState } from "react";
import { BigCalendar } from "@/components/calendar/BigCalendar";

import { getHolidaysApi, getAllLeavesApi } from "@/api/calendar.api";

export default function EmployeeCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadCalendarData();
  }, []);

const loadCalendarData = async () => {
  const [holidaysRes, leavesRes] = await Promise.all([
    getHolidaysApi(),
    getAllLeavesApi()
  ]);

  const holidays = holidaysRes.data.data.map((h: any) => ({
    title: h.name,
    start: h.date,
    allDay: true,
    type: "holiday",
    color: "#3b82f6"
  }));

  const leaves = leavesRes.data.data.map((l: any) => ({
    title: l.userName,
    start: l.startDate,
    end: l.endDate,
    allDay: true,

    // 👇 EXTRA DATA
    leaveType: l.leaveType,
    reason: l.reason || "—",
    dayType: l.dayType || "full", // full | half
    status: l.status,

    type: "leave",
    color:
      l.status === "approved"
        ? "#22c55e"
        : l.status === "pending"
        ? "#eab308"
        : "#ef4444"
  }));

  setEvents([...holidays, ...leaves]);
};


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Company Calendar</h2>
        <p className="text-muted-foreground mt-1">
          View holidays and employee leave schedule.
        </p>
      </div>

      <div className="h-[700px]">
        <BigCalendar events={events} />
      </div>
    </div>
  );
}
