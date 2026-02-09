import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEmployeeDailySummaryApi } from "@/api/admin.api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeDailyOverview() {
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedUserId, setSelectedUserId] = useState<number | "">("");
    const [view, setView] = useState<"day" | "week" | "month">("day");

    const [openSummary, setOpenSummary] = useState(false);


    const { data = [], isLoading } = useQuery({
        queryKey: ["employee-daily-summary", selectedDate, selectedUserId, view],
        queryFn: async () =>
            (
                await getEmployeeDailySummaryApi({
                    date: selectedDate,
                    range: view,
                    userId: selectedUserId,
                })
            ).data.data,
    });

    const summary = (() => {
        const source = selectedUserId
            ? data.filter((d: any) => d.userId === selectedUserId)
            : data;

        let tracked = 0;
        let worked = 0;

        source.forEach((emp: any) => {
            if (emp.checkIn && emp.checkOut) {
                const [inH, inM] = emp.checkIn.split(":").map(Number);
                const [outH, outM] = emp.checkOut.split(":").map(Number);

                tracked += Math.max(
                    outH * 60 + outM - (inH * 60 + inM),
                    0
                );
            }

            worked +=
                emp.tasks
                    ?.filter((t: any) => t.status === "approved")
                    .reduce((s: number, t: any) => s + (t.minutes || 0), 0) || 0;
        });

        return {
            tracked,
            worked,
            difference: tracked - worked,
            hasData: tracked > 0,
        };
    })();




    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    const getWorkedMinutes = (emp: any) =>
        emp.tasks
            ?.filter((t: any) => t.status === "approved")
            .reduce((sum: number, t: any) => sum + (t.minutes || 0), 0) || 0;


    return (
        <div className="p-6 space-y-6">
            <h2 className="text-3xl font-bold">Employee Daily Overview</h2>

            {/* ===== FILTER BAR ===== */}
            <div className="flex flex-wrap gap-4 items-center bg-card border rounded-lg p-4">
                {/* Date Picker */}
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                />

                {/* User Selector */}
                <select
                    value={selectedUserId}
                    onChange={(e) =>
                        setSelectedUserId(e.target.value ? Number(e.target.value) : "")
                    }
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                    <option value="">All Employees</option>
                    {data.map((emp: any) => (
                        <option key={emp.userId} value={emp.userId}>
                            {emp.userName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-2 mb-4">
                {["day",].map((v) => (
                    <button
                        key={v}
                        onClick={() => setView(v as any)}
                        className={`px-4 py-2 rounded-md text-sm border ${view === v
                            ? "bg-primary text-primary-foreground"
                            : "bg-background"
                            }`}
                    >
                        {v.toUpperCase()}
                    </button>
                ))}
            </div>


            {/* ===== TIME SUMMARY (AFTER CHECKOUT) ===== */}
            {summary.hasData && (
                <div
                    onClick={() => setOpenSummary(true)}
                    className="rounded-lg border bg-card p-5 space-y-4 cursor-pointer hover:shadow-md transition"
                >

                    <h3 className="text-lg font-semibold">
                        Time Summary (After Checkout)
                    </h3>

                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Tracked Time</p>
                            <p className="text-2xl font-bold">
                                {Math.floor(summary.tracked / 60)}:
                                {String(summary.tracked % 60).padStart(2, "0")}
                            </p>

                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Task Time</p>
                            <p className="text-2xl font-bold">
                                {Math.floor(summary.worked / 60)}:
                                {String(summary.worked % 60).padStart(2, "0")}
                            </p>

                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Difference</p>
                            <p
                                className={`text-2xl font-bold ${summary.difference >= 0 ? "text-red-600" : "text-green-600"
                                    }`}
                            >
                                {Math.floor(Math.abs(summary.difference) / 60)}:
                                {String(Math.abs(summary.difference) % 60).padStart(2, "0")}
                            </p>

                        </div>
                    </div>

                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full ${summary.worked >= summary.tracked
                                ? "bg-green-600"
                                : summary.worked >= summary.tracked * 0.6
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                            style={{
                                width: summary.tracked
                                    ? `${Math.min((summary.worked / summary.tracked) * 100, 100)}%`
                                    : "0%",
                            }}
                        />
                    </div>
                </div>
            )}



            {/* ===== CARDS ===== */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((emp: any) => {
                    const cardColor =
                        emp.pendingCount > 0
                            ? "border-red-500 bg-white-50"
                            : "border-white-500 bg-white-50";

                    return (
                        <Card
                            key={emp.userId}
                            className={`cursor-pointer hover:shadow-md transition border ${cardColor}`}
                            onClick={() => {
                                setSelectedEmployee(emp);
                                setIsOpen(true);
                            }}
                        >
                            <CardHeader className="space-y-2">
                                <CardTitle>{emp.userName}</CardTitle>

                                <p className="text-sm text-muted-foreground">
                                    {new Date(emp.date).toLocaleDateString()}
                                </p>

                                {emp.isHoliday ? (
                                    <span className="text-xs text-red-600 font-medium">
                                        On Holiday
                                    </span>
                                ) : (
                                    <div className="flex gap-4 text-sm">
                                        <span className="text-green-600">
                                            Approved: {emp.approvedCount}
                                        </span>
                                        <span
                                            className={
                                                emp.pendingCount > 0
                                                    ? "text-red-600"
                                                    : "text-yellow-600"
                                            }
                                        >
                                            Pending: {emp.pendingCount}
                                        </span>
                                    </div>
                                )}

                                {!emp.isHoliday && emp.totalEstimatedMinutes > 0 && (() => {
                                    const worked = getWorkedMinutes(emp);
                                    const percent = Math.min(
                                        Math.round((worked / emp.totalEstimatedMinutes) * 100),
                                        100
                                    );

                                    return (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>Progress</span>
                                                <span>{percent}%</span>
                                            </div>

                                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${percent >= 100
                                                            ? "bg-green-600"
                                                            : percent >= 60
                                                                ? "bg-yellow-500"
                                                                : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </CardHeader>
                        </Card>
                    );
                })}

                
            </div>

            {/* ===== POPUP ===== */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    className="w-[95vw] max-w-2xl max-h-[85vh] overflow-hidden p-0"
                >
                    {selectedEmployee && (
                        <div className="flex flex-col max-h-[85vh]">
                            {/* HEADER */}
                            <DialogHeader className="px-6 py-4 border-b">
                                <DialogTitle>
                                    {selectedEmployee.userName} –{" "}
                                    {new Date(selectedEmployee.date).toLocaleDateString()}
                                </DialogTitle>
                            </DialogHeader>

                            {/* BODY */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-muted-foreground">Check-in</p>
                                        <p className="font-medium">
                                            {selectedEmployee.checkIn || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Check-out</p>
                                        <p className="font-medium">
                                            {selectedEmployee.checkOut || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-muted-foreground mb-1">Tasks</p>

                                    <div className="rounded border p-3 space-y-2 max-h-48 overflow-y-auto bg-muted/30">
                                        {selectedEmployee.tasks?.length ? (
                                            selectedEmployee.tasks.map((task: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start justify-between gap-4 border-b last:border-b-0 pb-2"
                                                >
                                                    <div className="flex gap-2 break-words">
                                                        <span>•</span>
                                                        <span className="whitespace-pre-wrap break-all">
                                                            {task.task || "—"}
                                                        </span>
                                                    </div>

                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {task.minutes}m · {task.status}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground">No tasks</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="border-t px-6 py-4 flex justify-between bg-background">
                                <span className="text-muted-foreground">
                                    Total Estimated Time
                                </span>
                                <span className="font-semibold">
                                    {Math.floor(
                                        (selectedEmployee.totalEstimatedMinutes || 0) / 60
                                    )}
                                    h {(selectedEmployee.totalEstimatedMinutes || 0) % 60}m
                                </span>
                            </div>
                            {(() => {
                                const worked = getWorkedMinutes(selectedEmployee);
                                const estimated = selectedEmployee.totalEstimatedMinutes || 0;
                                const percent =
                                    estimated > 0
                                        ? Math.min(Math.round((worked / estimated) * 100), 100)
                                        : 0;

                                return (
                                    <div className="space-y-2 px-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Worked vs Estimated
                                            </span>
                                            <span className="font-medium">
                                                {worked}m / {estimated}m ({percent}%)
                                            </span>
                                        </div>

                                        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full ${percent >= 100
                                                    ? "bg-green-600"
                                                    : percent >= 60
                                                        ? "bg-yellow-500"
                                                        : "bg-red-500"
                                                    }`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })()}

                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={openSummary} onOpenChange={setOpenSummary}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Employee Time Summary</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {(selectedUserId
                            ? data.filter((d: any) => d.userId === selectedUserId)
                            : data
                        ).map((emp: any) => {
                            let tracked = 0;
                            if (emp.checkIn && emp.checkOut) {
                                const [inH, inM] = emp.checkIn.split(":").map(Number);
                                const [outH, outM] = emp.checkOut.split(":").map(Number);
                                tracked = Math.max(
                                    outH * 60 + outM - (inH * 60 + inM),
                                    0
                                );
                            }

                            const worked =
                                emp.tasks
                                    ?.filter((t: any) => t.status === "approved")
                                    .reduce((s: number, t: any) => s + (t.minutes || 0), 0) || 0;

                            const diff = tracked - worked;

                            return (
                                <div
                                    key={emp.userId}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div>
                                        <p className="font-medium">{emp.userName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(emp.date).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 text-sm text-right">
                                        <div>
                                            <p className="text-muted-foreground">Tracked</p>
                                            <p className="font-semibold">
                                                {Math.floor(tracked / 60)}:
                                                {String(tracked % 60).padStart(2, "0")}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-muted-foreground">Task</p>
                                            <p className="font-semibold">
                                                {Math.floor(worked / 60)}:
                                                {String(worked % 60).padStart(2, "0")}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-muted-foreground">Diff</p>
                                            <p
                                                className={`font-semibold ${diff >= 0 ? "text-red-600" : "text-green-600"
                                                    }`}
                                            >
                                                {Math.floor(Math.abs(diff) / 60)}:
                                                {String(Math.abs(diff) % 60).padStart(2, "0")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
