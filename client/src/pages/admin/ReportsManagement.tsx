import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Eye, Search } from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDailyReportsApi,
  approveDailyReportApi,
  rejectDailyReportApi,
} from "@/api/dailyReports.api";
import { useToast } from "@/hooks/use-toast";

const ADMIN_OPTIONS = [
  "Vipul Sir",
  "Mj Sir",
  "Rahul Sir",
  "Smit Sir",
];


export default function ReportsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<Record<number, string>>({});
  const [selectedUser, setSelectedUser] = useState<number | "">("");



  const { data, isLoading } = useQuery({
    queryKey: ["daily-reports"],
    queryFn: async () => (await getDailyReportsApi()).data.data,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, admin }: { id: number; admin: string }) =>
      approveDailyReportApi(id, admin),
    onSuccess: () => {
      toast({ title: "Report approved" });
      queryClient.invalidateQueries({
        queryKey: ["daily-reports"],
      });
    },
  });


  const formatMinutesToHM = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectDailyReportApi(id),
    onSuccess: () => {
      toast({ title: "Report rejected" });
      queryClient.invalidateQueries({
        queryKey: ["daily-reports"],
      });
    },
  });


  const reports = (data || []).slice().sort((a: any, b: any) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filteredReports = reports.filter((r: any) => {
    const matchesSearch =
      (r.tasks || "").toLowerCase().includes(search.toLowerCase());

    const matchesUser =
      selectedUser === "" || r.userId === selectedUser;

    return matchesSearch && matchesUser;
  });


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Daily Reports
          </h2>
          <p className="text-muted-foreground mt-1">
            Review daily work reports from employees.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border">
        <select
          value={selectedUser}
          onChange={(e) =>
            setSelectedUser(e.target.value ? Number(e.target.value) : "")
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-sm
                     focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Users</option>

          {Array.from(
            new Map(
              reports.map((r: any) => [
                r.userId,
                r.userName || `User #${r.userId}`,
              ])
            ).entries()
          ).map(([userId, displayName]) => (
            <option key={userId as number} value={userId as number}>
              {displayName as string}
            </option>
          ))}
        </select>



        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tasks..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        {/* MOBILE VIEW */}
        <div className="block md:hidden">
          {isLoading ? (
            <div className="p-5 text-center text-muted-foreground">
              Loading reports...
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {filteredReports.map((report: any) => {
                const date = new Date(report.date).toLocaleDateString();
                const status = report.status;

                return (
                  <div
                    key={report.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {report.userName || `User #${report.userId}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {date}
                        </p>
                      </div>

                      <Badge
                        className={
                          status === "approved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : status === "rejected"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                      >
                        {status}
                      </Badge>
                    </div>

                    <p className="text-sm">
                      {report.tasks}
                    </p>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hours</span>
                      <span>
                        {formatMinutesToHM(report.hoursSpent || 0)}
                      </span>
                    </div>

                    {status !== "approved" && (
                      <select
                        value={selectedAdmin[report.id] || ""}
                        onChange={(e) =>
                          setSelectedAdmin((prev) => ({
                            ...prev,
                            [report.id]: e.target.value,
                          }))
                        }
                        className="
                    h-9 w-full
                    rounded-md border border-input
                    bg-background px-3 text-sm
                    focus:outline-none focus:ring-1 focus:ring-ring
                  "
                      >
                        <option value="">Select admin</option>
                        {ADMIN_OPTIONS.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex gap-2">
                      {status !== "approved" && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const admin = selectedAdmin[report.id];
                            if (!admin) {
                              toast({
                                title: "Please select admin before approving",
                                variant: "destructive",
                              });
                              return;
                            }

                            approveMutation.mutate({
                              id: report.id,
                              admin,
                            });
                          }}
                        >
                          Approve
                        </Button>
                      )}

                      {status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => rejectMutation.mutate(report.id)}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredReports.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No reports found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* DESKTOP TABLE — YOUR EXISTING CODE */}
        <div className="hidden md:block">
          {isLoading ? (
            <div className="p-5 text-center text-muted-foreground">
              Loading reports...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[400px]">Tasks</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredReports.map((report: any) => {
                  const date = new Date(report.date).toLocaleDateString();
                  const status = report.status;

                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.userName || `User #${report.userId}`}
                      </TableCell>

                      <TableCell>{date}</TableCell>

                      <TableCell className="truncate max-w-[400px]">
                        {report.tasks}
                      </TableCell>

                      <TableCell>
                        {formatMinutesToHM(report.hoursSpent || 0)}
                      </TableCell>

                      <TableCell>
                        {status === "approved" ? (
                          <span className="text-sm text-muted-foreground">
                            {report.admin || "-"}
                          </span>
                        ) : (
                          <select
                            value={selectedAdmin[report.id] || ""}
                            onChange={(e) =>
                              setSelectedAdmin((prev) => ({
                                ...prev,
                                [report.id]: e.target.value,
                              }))
                            }
                            className="
                        h-9 w-full min-w-[140px]
                        rounded-md border border-input
                        bg-background px-3 text-sm
                        focus:outline-none focus:ring-1 focus:ring-ring
                      "
                          >
                            <option value="">Select admin</option>
                            {ADMIN_OPTIONS.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            status === "approved"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : status === "rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right flex gap-2 justify-end">
                        {status !== "approved" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              const admin = selectedAdmin[report.id];
                              if (!admin) {
                                toast({
                                  title:
                                    "Please select admin before approving",
                                  variant: "destructive",
                                });
                                return;
                              }

                              approveMutation.mutate({
                                id: report.id,
                                admin,
                              });
                            }}
                          >
                            Approve
                          </Button>
                        )}

                        {status !== "rejected" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              rejectMutation.mutate(report.id)
                            }
                          >
                            Reject
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

    </div>
  );
}
