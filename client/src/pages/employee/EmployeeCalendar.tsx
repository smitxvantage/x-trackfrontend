import { BigCalendar } from '@/components/calendar/BigCalendar';

export default function EmployeeCalendar() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Company Calendar</h2>
        <p className="text-muted-foreground mt-1">View holidays and team leave schedule.</p>
      </div>
      
      <div className="h-[700px]">
        <BigCalendar />
      </div>
    </div>
  );
}
