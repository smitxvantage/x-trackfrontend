import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEmployeeApi,
  getEmployeesApi,
  getSalaryApi,
} from "@/api/salary.api";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { getUsersApi } from "@/api/users.api";
import { User } from "@/types";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
interface Employee {
  id: string | number;
  name: string;
  salary: string;
}

const SalaryManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", salary: "" });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const now = new Date();
  const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const previousYear =
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    previousMonthDate
  );

  const month = selectedDate ? selectedDate.getMonth() + 1 : previousMonth + 1;
  const year = selectedDate ? selectedDate.getFullYear() : previousYear;

  const {
    data: salaries = [],
    isLoading,
    refetch,
  } = useQuery<any[]>({
    queryKey: ["salaries", year, month],
    queryFn: () => getSalaryApi(year, month).then((res) => res.data),
  });

  useEffect(() => {
    if (selectedDate) refetch();
  }, [selectedDate, refetch]);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res: AxiosResponse<{ data: User[] }> = await getUsersApi();
      return res.data.data;
    },
  });
  console.log("Users:", users);
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await getEmployeesApi();
      return res.data;
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await createEmployeeApi(data);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: "Employee Added" });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsAddOpen(false);
      setForm({ name: "", salary: "" });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to create employee",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Salary Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage employee pay records, configure salary components, and
            streamline monthly disbursements.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Employee
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Select
                  value={form.name}
                  onValueChange={(val) => updateField("name", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.username || ""}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Salary</Label>
                <Input
                  value={form.salary}
                  onChange={(e) => updateField("salary", e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => createEmployee.mutate(form)}>
                Create Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Salary</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="capitalize">{emp.name}</TableCell>
                <TableCell>{emp.salary}</TableCell>
              </TableRow>
            ))}

            {employees.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center text-muted-foreground h-24"
                >
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
   <div className="flex justify-between items-center mb-5 py-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
           Salary Calculation Summary
          </h2>
          <p className="text-muted-foreground mt-1">
           View monthly salary breakdowns, leaves, and final payouts for employees.
          </p>
        </div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={["year", "month"]}
            label="Select Month"
            minDate={new Date("2020-01-01")}
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
          />
        </LocalizationProvider>
      </div>
      <div className="space-y-6">
         {salaries.length === 0 && !isLoading ? (
         <div className="rounded-md border bg-card text-center py-5">
              No salary data for this month
            </div>
        ) : (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Paid Leave</TableHead>
                  <TableHead>Days of month</TableHead>
                  <TableHead>Sunday of month</TableHead>
                   <TableHead>Non Working saturday</TableHead>
                  <TableHead>Holiday of month</TableHead>
                  <TableHead>working days</TableHead>
                    <TableHead>Salary per day</TableHead>
                     <TableHead>Paid Leave Salary</TableHead>
                  <TableHead>Payable Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.map((emp) => (
                  <TableRow key={emp.id} className="text-center">
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.salary}</TableCell>
                    <TableCell>{emp.getLeaves}</TableCell>
                     <TableCell>{emp.summary.totalDays}</TableCell>
                      <TableCell>{emp.summary.sundays}</TableCell>
                       <TableCell>{1}</TableCell>
                        <TableCell>{emp.summary.holidays}</TableCell>
                    <TableCell>{emp.summary.workingDays}</TableCell>
                    <TableCell>{emp.perDay}</TableCell>
                    <TableCell>{emp.paidLeaveSalary}</TableCell>
                    <TableCell>{emp.finalSalary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryManagement;
