import { useState } from 'react';
import { BigCalendar } from '@/components/calendar/BigCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useCalendarStore, Holiday } from '@/store/calendarStore';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HolidayManagement() {
  const { holidays, addHoliday, removeHoliday } = useCalendarStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Public');

  const handleAddHoliday = () => {
    if (title && date) {
      const newHoliday: Holiday = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        date: new Date(date),
        type: type as any
      };
      addHoliday(newHoliday);
      setIsAddOpen(false);
      // Reset form
      setTitle('');
      setDate('');
      setType('Public');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar & Holidays</h2>
          <p className="text-muted-foreground mt-1">Manage company holidays and view the team schedule.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Holiday</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Holiday Name</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Independence Day" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public Holiday</SelectItem>
                    <SelectItem value="Optional">Optional Holiday</SelectItem>
                    <SelectItem value="Company Event">Company Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddHoliday}>Add Holiday</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Calendar View */}
        <div className="md:col-span-8 h-[600px]">
          <BigCalendar />
        </div>

        {/* Holiday List Sidebar */}
        <div className="md:col-span-4 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Holidays</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...holidays].sort((a, b) => a.date.getTime() - b.date.getTime()).map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{format(holiday.date, 'MMM d')}</span>
                          <span className="text-xs text-muted-foreground">{format(holiday.date, 'yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{holiday.title}</span>
                          <span className="text-xs text-muted-foreground">{holiday.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeHoliday(holiday.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {holidays.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                        No holidays added.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
