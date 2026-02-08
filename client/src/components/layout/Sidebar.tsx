import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  UserCircle,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface SidebarProps {
  role: "admin" | "employee";
  onNavigate?: () => void; // for mobile drawer close
}

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const [location] = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/attendance", label: "Attendance", icon: Calendar },
    { href: "/admin/reports", label: "Daily Reports", icon: FileText },
    { href: "/admin/daily-overview", label: "Daily Overview", icon: FileText },
    { href: "/admin/holidays", label: "Holidays", icon: Calendar },
    { href: "/admin/leaves", label: "Leave Management", icon: Briefcase },
    { href: "/admin/salary", label: "Salary Management", icon: Wallet },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const employeeLinks = [
    { href: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employee/calendar", label: "Company Calendar", icon: Calendar },
    { href: "/employee/attendance", label: "My Attendance", icon: Calendar },
    { href: "/employee/reports", label: "Daily Reports", icon: FileText },
    { href: "/employee/leaves", label: "Leave Requests", icon: Briefcase },
    { href: "/employee/profile", label: "My Profile", icon: UserCircle },
  ];

  const links = role === "admin" ? adminLinks : employeeLinks;

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">
              X
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight">Xtrack</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;

            return (
              <Link key={link.href} href={link.href}>
                <a
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t p-4">
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
