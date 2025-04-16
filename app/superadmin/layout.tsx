"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  LayoutDashboard,
  UserCheck,
  LogOut,
  Menu,
  X,
  Shield,
  Building,
  AlertTriangle,
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TutorialMenu } from "@/components/ui/tutorial/tutorial-menu";
import { WelcomeTutorial } from "@/components/ui/tutorial/welcome-tutorial";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { admin, isAuthenticated, logout } = useAuthStore();

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || !admin) {
      router.push("/superadmin/login");
      return;
    }

    // Check if user is a super admin
    if (admin.role !== "super_admin") {
      logout();
      router.push("/superadmin/login");
    }
  }, [isAuthenticated, admin, router, logout]);

  // Hide sidebar on smaller screens by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/superadmin/login");
  };

  // If not authenticated, don't render the layout
  // Also skip layout for login page
  if (!isAuthenticated || !admin || pathname === "/superadmin/login") {
    return <>{children}</>;
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/superadmin/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/superadmin/dashboard",
    },
    {
      name: "Admin Verification",
      href: "/superadmin/admin-verification",
      icon: UserCheck,
      current: pathname === "/superadmin/admin-verification",
    },
    {
      name: "Manage Departments",
      href: "/superadmin/departments",
      icon: Building,
      current: pathname.startsWith("/superadmin/departments"),
    },
    {
      name: "System Settings",
      href: "/superadmin/settings",
      icon: Settings,
      current: pathname === "/superadmin/settings",
    },
    {
      name: "Tutorials",
      href: "/superadmin/tutorials",
      icon: HelpCircle,
      current: pathname === "/superadmin/tutorials",
    },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b px-4 py-2 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold flex items-center text-primary"
          >
            <span className="bg-primary text-white p-1 rounded mr-1">e</span>
            Vote
            <span className="text-xs ml-2 text-gray-500 font-normal">
              SuperAdmin
            </span>
          </Link>

          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
          >
            {isMobileSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-20 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            ></div>

            {/* Mobile sidebar content */}
            <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <Link
                  href="/"
                  className="text-lg font-bold flex items-center text-primary"
                >
                  <span className="bg-primary text-white p-1 rounded mr-1">
                    e
                  </span>
                  Vote
                  <span className="text-xs ml-2 text-gray-500 font-normal">
                    SuperAdmin
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2">
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                        item.current
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          item.current
                            ? "text-white"
                            : "text-gray-400 group-hover:text-primary"
                        )}
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="border-t px-4 py-2">
                <div className="flex items-center py-2">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">
                      {admin.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                      {admin.email}
                    </p>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <Link
                    href="/"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Home className="mr-3 h-5 w-5 text-gray-400" />
                    Main Site
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full group flex items-center rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-red-400" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div
          className={cn(
            "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:border-r transition-all duration-300 ease-in-out z-20 bg-white",
            isSidebarOpen ? "lg:w-64" : "lg:w-20"
          )}
        >
          {/* Sidebar header with logo */}
          <div
            className={cn(
              "flex items-center border-b px-6 py-3",
              !isSidebarOpen && "justify-center px-3"
            )}
          >
            <Link
              href="/"
              className={cn(
                "text-lg font-bold flex items-center text-primary",
                !isSidebarOpen && "justify-center"
              )}
            >
              <span className="bg-primary text-white p-1 rounded mr-1">e</span>
              {isSidebarOpen && (
                <>
                  Vote
                  <span className="text-xs ml-2 text-gray-500 font-normal">
                    SuperAdmin
                  </span>
                </>
              )}
            </Link>

            {isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="ml-auto rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mt-2 w-full rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-5 w-5 mx-auto" />
              </button>
            )}
          </div>

          {/* Sidebar content */}
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 space-y-1 px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    item.current
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-primary/10 hover:text-primary",
                    !isSidebarOpen && "justify-center px-2"
                  )}
                  title={!isSidebarOpen ? item.name : ""}
                >
                  <item.icon
                    className={cn(
                      "flex-shrink-0 h-5 w-5",
                      item.current
                        ? "text-white"
                        : "text-gray-400 group-hover:text-primary",
                      isSidebarOpen && "mr-3"
                    )}
                  />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              ))}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="border-t px-3 py-4">
            {isSidebarOpen ? (
              <>
                <div className="flex items-center py-2">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">
                      {admin.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[160px]">
                      {admin.email}
                    </p>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <Link
                    href="/"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Home className="mr-3 h-5 w-5 text-gray-400" />
                    Main Site
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full group flex items-center rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-red-400" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-md p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div
          className={cn(
            "flex flex-col lg:pl-64 transition-all duration-300 ease-in-out",
            !isSidebarOpen && "lg:pl-20",
            "pt-16 lg:pt-0"
          )}
        >
          {/* Desktop header with tutorial menu */}
          <div className="bg-white border-b border-gray-200 hidden lg:flex items-center justify-end h-16 px-6">
            <TutorialMenu className="mr-3" />
          </div>

          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto px-4 sm:px-6 md:px-8">{children}</div>
            </div>
          </main>
        </div>

        {/* Welcome tutorial */}
        <WelcomeTutorial />
      </div>
    </TooltipProvider>
  );
}
