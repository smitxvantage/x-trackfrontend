import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/authStore';
import { Redirect } from 'wouter';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "wouter";



interface EmployeeLayoutProps {
  children: ReactNode;
}

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated || user?.role !== 'employee') {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* DESKTOP SIDEBAR */}
      {!isMobile && <Sidebar role="employee" />}

      {/* MOBILE SIDEBAR (DRAWER) */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar role="employee" />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-16 border-b bg-card px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <h1 className="text-lg font-semibold text-foreground">
              Employee Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>

            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.position || "Employee"}
                </p>
              </div>
              <Link href="/employee/profile">
                <a className="cursor-pointer">
                  <Avatar>
                    <AvatarImage
                      src={
                        user.avatar
                          ? `${import.meta.env.VITE_API_BASE_URL}${user.avatar}`
                          : undefined
                      }
                    />

                    <AvatarFallback>
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "EM"}
                    </AvatarFallback>

                  </Avatar>
                </a>
              </Link>

            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );

}
