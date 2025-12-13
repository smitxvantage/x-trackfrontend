import { useEffect, useState } from 'react';
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
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getHolidaysApi,
  createHolidayApi,
  deleteHolidayApi
} from "@/api/holidays.api";
import { toast } from "@/hooks/use-toast";
import { useCalendarStore } from "@/store/calendarStore";
export default function HolidayManagement() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Public');
const setStoreHolidays = useCalendarStore((s) => s.setHolidays);
  // Load holidays from backend
  const loadHolidays = async () => {
    try {
      const res = await getHolidaysApi();
      const formatted =res.data.data.map((h: any) => ({
      id: String(h.id),
      title: h.name,
      date: new Date(h.date),
      type: type,
    }));
     setStoreHolidays(formatted);  
      setHolidays(res.data.data);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load holidays" });
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  // Add new holiday
  const handleAddHoliday = async () => {
    try {
      const res = await createHolidayApi({
        name: title,
        date,
      });

      toast({ title: "Holiday added" });

      setIsAddOpen(false);
      setTitle('');
      setDate('');
      setType('Public');

      await loadHolidays();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to add holiday" });
    }
  };

  // Delete holiday
  const handleDelete = async (id: number) => {
    try {
      await deleteHolidayApi(id);
      toast({ title: "Holiday removed" });
      await loadHolidays();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to delete holiday" });
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
                <Label>Holiday Name</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
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

        {/* Holiday List */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Holidays</CardTitle>
            </CardHeader>
            <CardContent className="p-0">

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {holidays.map((h: any) => (
                    <TableRow key={h.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{format(h.date, "MMM d")}</span>
                          <span className="text-xs text-muted-foreground">{format(h.date, "yyyy")}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{h.name}</span>
                          <span className="text-xs text-muted-foreground">{type}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-red-600"
                          onClick={() => handleDelete(h.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {holidays.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
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
