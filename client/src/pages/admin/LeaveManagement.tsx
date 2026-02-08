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
import { Trash2 } from "lucide-react";
import { deleteLeaveApi } from "@/api/leaves.api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";




export default function LeaveManagement() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const setStoreLeaves = useCalendarStore((s) => s.setLeaves);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteLeaveApi(deleteId);
      toast({ title: "Leave deleted permanently" });
      setDeleteId(null);
      await loadLeaves();
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to delete leave",
      });
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
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Leave Management</h2>
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
            {/* MOBILE VIEW */}
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {pending.map((request: any) => (
                  <div
                    key={request.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {request.userName || `User #${request.userId}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.leaveType}
                        </p>
                      </div>

                      <Badge className="bg-yellow-500 text-white">
                        Pending
                      </Badge>
                    </div>

                    <div className="text-sm space-y-1">
                      <p>
                        {formatDate(request.startDate)} –{" "}
                        {formatDate(request.endDate)}
                      </p>

                      {request.dayType === "half" ? (
                        <p className="text-orange-600 font-medium">
                          Half Day • {request.startTime} – {request.endTime}
                        </p>
                      ) : (
                        <p className="text-green-600 font-medium">
                          Full Day
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {request.reason}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600"
                        onClick={() =>
                          handleUpdateStatus(request.id, "rejected")
                        }
                      >
                        Reject
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-green-600"
                        onClick={() =>
                          handleUpdateStatus(request.id, "approved")
                        }
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}

                {pending.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No pending requests.
                  </p>
                )}
              </div>
            </div>

            {/* DESKTOP TABLE — YOUR EXISTING CODE */}
            <div className="hidden md:block">
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
                              <div className="font-medium text-orange-600">
                                Half Day
                              </div>
                              <div>
                                {request.startTime} – {request.endTime}
                              </div>
                            </>
                          ) : (
                            <div className="font-medium text-green-600">
                              Full Day
                            </div>
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
          </div>

          <EmployeeLeaveOverview />
        </TabsContent>


        {/* ---------------------- */}
        {/* HISTORY TAB */}
        {/* ---------------------- */}
        <TabsContent value="history" className="mt-4">
          <div className="rounded-md border bg-card">
            {/* MOBILE VIEW */}
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {history.map((request: any) => (
                  <div
                    key={request.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {request.userName || `User #${request.userId}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(request.startDate)} –{" "}
                          {formatDate(request.endDate)}
                        </p>
                      </div>

                      <Badge
                        className={
                          request.status === "approved"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>

                    <div className="text-sm">
                      {request.dayType === "half" ? (
                        <p className="text-orange-600 font-medium">
                          Half Day • {request.startTime} – {request.endTime}
                        </p>
                      ) : (
                        <p className="text-green-600 font-medium">
                          Full Day
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {request.reason || "—"}
                    </p>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => setDeleteId(request.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}

                {history.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No leave history found.
                  </p>
                )}
              </div>
            </div>

            {/* DESKTOP TABLE — YOUR EXISTING CODE */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Day Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {history.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.userName || `User #${request.userId}`}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`text-sm font-medium ${request.dayType === "half"
                              ? "text-orange-600"
                              : "text-green-600"
                            }`}
                        >
                          {request.dayType === "half"
                            ? "Half Day"
                            : "Full Day"}
                        </span>

                        {request.dayType === "half" && (
                          <div className="text-xs text-muted-foreground">
                            {request.startTime} – {request.endTime}
                          </div>
                        )}
                      </TableCell>

                      <TableCell
                        className="max-w-[200px] truncate"
                        title={request.reason}
                      >
                        {request.reason || "—"}
                      </TableCell>

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

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(request.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {history.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground h-24"
                      >
                        No leave history found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Leave Request?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
              This will permanently delete the leave record.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
}
