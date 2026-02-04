import { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  endOfDay,
  startOfDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { LeaveEvent, useCalendarStore } from "@/store/calendarStore";
import { cn } from "@/lib/utils";
import { getLeavesApi } from "@/api/leaves.api";

export function BigCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { holidays, leaves, setLeaves } = useCalendarStore();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const loadApprovedLeaves = async () => {
    try {
      const res = await getLeavesApi();
      const list = res.data.data || [];
      const approved: LeaveEvent[] = list
        .filter((l: any) => l.status === "approved")
        .map((l: any) => ({
          id: String(l.id),
          employeeName: l.userName || `User #${l.userId}`,
          startDate: startOfDay(new Date(l.startDate)),
          endDate: endOfDay(startOfDay(new Date(l.endDate))),
          type: l.leaveType,
          status: "Approved",
        }));

      setLeaves(approved);
    } catch (e) {
      console.log("Calendar load failed", e);
    }
  };
  useEffect(() => {
    loadApprovedLeaves();
  }, []);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day: Date) => {
    const dayHolidays = holidays.filter((h) => isSameDay(h.date, day));
    const dayLeaves = leaves.filter((l) =>
      isWithinInterval(day, { start: l.startDate, end: l.endDate })
    );
    return { dayHolidays, dayLeaves };
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center rounded-md border bg-background shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="h-8 border-x rounded-none px-3 font-normal"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-100 border border-red-200" />
            <span className="text-muted-foreground">Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-100 border border-amber-200" />
            <span className="text-muted-foreground">Leave</span>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {calendarDays.map((day, dayIdx) => {
          const { dayHolidays, dayLeaves } = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          console.log(dayHolidays, "dayHolidays");
          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[100px] p-2 border-b border-r relative transition-colors hover:bg-accent/5",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                dayIdx % 7 === 0 && "border-l-0", // Remove left border for first col if needed, but grid handles it usually
                // Tailwind grid borders are tricky, simplified approach:
                "border-border"
              )}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                    isToday && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                {dayHolidays.map((holiday) => (
                  <HoverCard key={holiday.id}>
                    <HoverCardTrigger asChild>
                      <div className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-700 border border-red-200 truncate cursor-pointer font-medium">
                        {holiday.title}
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-60 p-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">
                          {holiday.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {holiday.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(holiday.date, "PPPP")}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}

                {dayLeaves.map((leave) => (
                  <HoverCard key={leave.id}>
                    <HoverCardTrigger asChild>
                      <div className="px-2 py-1 text-xs rounded-md bg-amber-100 text-amber-700 border border-amber-200 truncate cursor-pointer">
                        {leave.employeeName}
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-60 p-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">
                          {leave.employeeName}
                        </h4>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {leave.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(leave.startDate, "MMM d")} -{" "}
                          {format(leave.endDate, "MMM d")}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
