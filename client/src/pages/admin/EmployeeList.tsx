import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreVertical, Filter } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsersApi, createUserApi, deleteUserApi } from "@/api/users.api";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Employee Form
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "employee",
  });

  const { data: employees, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await getUsersApi()).data.data,
  });

  const createEmployee = useMutation({
    mutationFn: (data: any) => createUserApi(data),
    onSuccess: () => {
      toast({ title: "Employee Added" });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      setIsAddOpen(false);
      setForm({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "employee",
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to create employee",
      });
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: (id: number) => deleteUserApi(id),
    onSuccess: () => {
      toast({ title: "Employee Deleted" });
      queryClient.invalidateQueries({ queryKey: ["users"] });

    },
  });

  const filteredEmployees = employees?.filter((emp: any) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.department || "").toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Update form field
  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Employees
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your team members and their roles.
          </p>
        </div>

        {/* ADD EMPLOYEE DIALOG */}
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
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(val) => updateField("role", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-card p-4 rounded-lg border">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* TABLE */}
      {/* EMPLOYEE LIST */}
      <div className="rounded-md border bg-card">
        {/* MOBILE VIEW */}
        <div className="block md:hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading employees...
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {filteredEmployees.map((emp: any) => (
                <div
                  key={emp.id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {emp.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {emp.email}
                        </p>
                      </div>
                    </div>

                    <Badge>
                      {emp.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium capitalize">{emp.role}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600"
                      onClick={() => deleteEmployee.mutate(emp.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {filteredEmployees.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No employees found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading employees...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredEmployees.map((emp: any) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {emp.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="capitalize">{emp.role}</TableCell>
                    <TableCell>{emp.email}</TableCell>

                    <TableCell>
                      <Badge>{emp.isActive ? "Active" : "Inactive"}</Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteEmployee.mutate(emp.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

    </div>
  );
}
