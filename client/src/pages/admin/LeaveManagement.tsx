import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X } from "lucide-react";
import {
  getLeaveHistory,
  getLeavesApi,
  updateLeaveStatusApi,
} from "@/api/leaves.api";
import { toast } from "@/hooks/use-toast";
import { LeaveEvent, useCalendarStore } from "@/store/calendarStore";
import { endOfDay, startOfDay } from "date-fns";
import EmployeeLeaveOverview from "./EmployeeLeaveOverview";
export default function LeaveManagement() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const setStoreLeaves = useCalendarStore((s) => s.setLeaves);
  // const loadLeaves = async () => {
  //   try {
  //     const res = await getLeavesApi();
  //     setLeaves(res.data.data || []);
  //   } catch {
  //     toast({ variant: "destructive", title: "Failed to load leave requests" });
  //   }
  // };

  const normalizeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return startOfDay(d);
  };
  const loadLeaves = async () => {
    try {
      const res = await getLeavesApi();
      const list = res.data.data || [];

      setLeaves(list);

      const approvedEvents: LeaveEvent[] = list
        .filter((l: any) => l.status === "approved")
        .map((l: any) => ({
          id: String(l.id),
          employeeName: l.userName || `User #${l.userId}`,
          startDate: normalizeDate(l.startDate),
          endDate: endOfDay(normalizeDate(l.endDate)),
          type: l.leaveType,
          status: "Approved",
        }));

      setStoreLeaves(approvedEvents);
    } catch {
      toast({ variant: "destructive", title: "Failed to load leave requests" });
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleUpdateStatus = async (
    id: number,
    status: "approved" | "rejected"
  ) => {
    try {
      await updateLeaveStatusApi(id, status);

      toast({ title: `Leave ${status}` });

      await loadLeaves();
    } catch {
      toast({ variant: "destructive", title: "Failed to update leave" });
    }
  };

  const pending = leaves.filter((l: any) => l.status === "pending");
  const history = leaves.filter((l: any) => l.status !== "pending");

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
        <p className="text-muted-foreground mt-1">
          Review and manage employee leave requests.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ---------------------- */}
        {/* PENDING REQUESTS TAB */}
        {/* ---------------------- */}
        <TabsContent value="pending" className="mt-4">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pending.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.userName || `User #${request.userId}`}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{request.leaveType}</Badge>
                    </TableCell>

                    <TableCell>
                      {formatDate(request.startDate)} –{" "}
                      {formatDate(request.endDate)}
                      <div className="text-xs text-muted-foreground space-y-1">
                        {request.dayType === "half" ? (
                          <>
                            <div className="font-medium text-orange-600">Half Day</div>
                            <div>
                              {request.startTime} – {request.endTime}
                            </div>
                          </>
                        ) : (
                          <div className="font-medium text-green-600">Full Day</div>
                        )}
                      </div>

                    </TableCell>

                    <TableCell
                      className="max-w-[200px] truncate"
                      title={request.reason}
                    >
                      {request.reason}
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-yellow-500 text-white">
                        Pending
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          onClick={() =>
                            handleUpdateStatus(request.id, "rejected")
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                          onClick={() =>
                            handleUpdateStatus(request.id, "approved")
                          }
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {pending.length === 0 && (
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
     <EmployeeLeaveOverview />
        </TabsContent>

        {/* ---------------------- */}
        {/* HISTORY TAB */}
        {/* ---------------------- */}
        <TabsContent value="history" className="mt-4">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {history.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.userName || `User #${request.userId}`}
                    </TableCell>

                    <TableCell>{request.leaveType}</TableCell>

                    <TableCell>
                      {formatDate(request.startDate)} –{" "}
                      {formatDate(request.endDate)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          request.status === "approved"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {history.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground h-24"
                    >
                      No leave history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
