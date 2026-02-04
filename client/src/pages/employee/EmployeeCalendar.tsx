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
      color: "#3b82f6" // blue
    }));

    const leaves = leavesRes.data.data.map((l: any) => ({
      title: `${l.userName} - ${l.leaveType}`,
      start: l.startDate,
      end: l.endDate,
      allDay: true,
      color:
        l.status === "approved"
          ? "#22c55e" // green
          : l.status === "pending"
          ? "#eab308" // yellow
          : "#ef4444" // red
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
