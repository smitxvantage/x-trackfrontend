import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarDays, Plus } from "lucide-react";

import {
  getMyLeavesApi,
  applyLeaveApi,
  cancelLeaveApi,
} from "@/api/leaves.api";
import { toast } from "@/hooks/use-toast";

export default function MyLeaves() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [leaves, setLeaves] = useState([]);

  // Form State
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [dayType, setDayType] = useState("full");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  // Load leaves
  const loadLeaves = async () => {
    try {
      const res = await getMyLeavesApi();
      setLeaves(res.data.data);
    } catch (err) {
      toast({ title: "Failed to load leaves", variant: "destructive" });
    }
  };

  // Submit leave
  const submitLeave = async () => {
    if (!leaveType || !fromDate || !toDate || !reason) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }

    try {
      await applyLeaveApi({
        leaveType,
        startDate: fromDate,
        endDate: toDate,
        totalDays:
         dayType === "half"
    ? 0.5
    : (new Date(toDate).getTime() - new Date(fromDate).getTime()) /
        (1000 * 60 * 60 * 24) +
      1,
        reason,
        dayType,
        startTime,
        endTime
      });

      toast({ title: "Leave submitted successfully" });
      setIsAddOpen(false);
      loadLeaves();

      // Reset form
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
      setDayType("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      toast({ title: "Failed to submit leave", variant: "destructive" });
    }
  };

  // Cancel a pending leave
  const cancelLeave = async (id: number) => {
    try {
      await cancelLeaveApi(id);
      toast({ title: "Leave cancelled" });
      loadLeaves();
    } catch (err) {
      toast({ title: "Failed to cancel leave", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Leaves</h2>
          <p className="text-muted-foreground mt-1">
            Manage your leave requests and view balance.
          </p>
        </div>

        {/* ADD LEAVE DIALOG */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Request Leave
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Leave Type */}
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="urgent">Urgent Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Day Type</Label>
                <Select value={dayType} onValueChange={setDayType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Leave Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Day</SelectItem>
                    <SelectItem value="half">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            {dayType === "half" && (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Start Time</Label>
        <Input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>End Time</Label>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
    </div>
  )}
              {/* Reason */}
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you taking leave?"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitLeave}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* LEAVE HISTORY */}
      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>Your recent leave activity</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {leaves.map((leave: any) => (
              <div
                key={leave.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
              >
                {/* Left section */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold capitalize">
                        {leave.leaveType}
                      </h4>

                      <Badge
                        variant="outline"
                        className={
                          leave.status === "approved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : leave.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : leave.status === "cancelled"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {leave.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {leave.startDate} → {leave.endDate}
                    </p>

                    <p className="text-sm mt-1">{leave.reason}</p>
                  </div>
                </div>

                {/* Cancel button */}
                <div className="flex gap-2 self-end sm:self-center">
                  {leave.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => cancelLeave(leave.id)}
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
