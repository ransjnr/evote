"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Calendar,
  Tag,
  Users,
  BarChart3,
  CreditCard,
  UserCog,
  Building,
  LogOut,
  Trophy,
  HelpCircle,
  Phone,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { TutorialMenu } from "@/components/ui/tutorial/tutorial-menu";
import { WelcomeTutorial } from "@/components/ui/tutorial/welcome-tutorial";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isAuthenticated, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [departmentCreated, setDepartmentCreated] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // List all departments to check what exists
  const allDepartments = useQuery(api.departments.listDepartments) || [];

  // Safe helper function to determine if we should query department
  const getSafeSlugQueryArg = () => {
    // If we're on login/register pages, don't make the query
    if (pathname === "/admin/login" || pathname === "/admin/register") {
      return "skip";
    }

    // Only query if admin and departmentId exist
    if (admin && admin.departmentId) {
      return { slug: admin.departmentId };
    }

    return "skip";
  };

  // Get department info with safe query argument
  const department = useQuery(
    api.departments.getDepartmentBySlug,
    getSafeSlugQueryArg()
  );

  // Create department mutation
  const createDepartment = useMutation(api.departments.createDepartment);

  // Check if there might be an error with department fetch
  const isDepartmentError = admin?.departmentId && department === undefined;

  // Auto-handle missing department
  useEffect(() => {
    // Skip if on login/register page or no admin loaded yet
    if (
      pathname === "/admin/login" ||
      pathname === "/admin/register" ||
      !admin
    ) {
      return;
    }

    const handleMissingDepartment = async () => {
      // Only proceed if admin exists, department is undefined (error occurred),
      // and we haven't already tried to create the department
      if (
        admin?.departmentId &&
        (department === undefined || isDepartmentError) &&
        !isCreatingDepartment &&
        !departmentCreated &&
        allDepartments !== undefined // Make sure we've loaded all departments
      ) {
        console.log(
          "Department not found or error loading department - attempting to fix"
        );
        console.log("Admin departmentId:", admin.departmentId);
        console.log("All departments:", allDepartments);

        // Check if any department with this slug already exists
        const existingDepartment = allDepartments.find(
          (dept) => dept.slug === admin.departmentId
        );

        if (!existingDepartment) {
          console.log("No matching department found, creating one");
          setIsCreatingDepartment(true);

          try {
            const result = await createDepartment({
              name: `Department for ${admin.name}`,
              description: "Auto-created to fix missing department issue",
              slug: admin.departmentId,
              adminId: admin._id,
            });

            if (result.success) {
              console.log("Department created successfully:", result);
              setDepartmentCreated(true);
              toast.success(
                "Department created successfully. System will now load correctly."
              );
              // Force a refresh after a short delay to reload everything
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
          } catch (error: any) {
            console.error("Failed to create department:", error);
            toast.error(error.message || "Failed to create department");
            // Add a way for the user to bypass this error in extreme cases
            const bypassError = window.confirm(
              "There was an error creating the department. Would you like to bypass this check and continue anyway? (This may cause some features to not work properly)"
            );
            if (bypassError) {
              // Set a temporary bypass flag in session storage
              sessionStorage.setItem("bypass_department_check", "true");
              window.location.reload();
            }
          } finally {
            setIsCreatingDepartment(false);
          }
        } else {
          console.log(
            "Matching department found but query failed:",
            existingDepartment
          );
          // Department exists but query still fails - this suggests a deeper issue
          toast.error(
            "Department exists but couldn't be loaded. Try refreshing the page."
          );
        }
      }
    };

    // Add a small delay before trying to create the department
    // to ensure the query has had time to fail
    const timer = setTimeout(() => {
      handleMissingDepartment();
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    admin,
    department,
    allDepartments,
    createDepartment,
    isCreatingDepartment,
    departmentCreated,
    pathname,
  ]);

  // Redirect to login if not authenticated and not on login/register pages
  useEffect(() => {
    const publicRoutes = [
      "/admin/login",
      "/admin/register",
      "/admin/verification-pending",
      "/admin/registration-success",
    ];

    // Check if we're on a public route that doesn't require authentication
    const isPublicRoute = publicRoutes.includes(pathname);

    // Skip auth check if on public route
    if (isPublicRoute) {
      setIsLoading(false);
      return;
    }

    // For protected routes, check authentication
    // Give browser time to rehydrate the Zustand store from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        router.replace("/admin/login");
        return;
      }

      setIsLoading(false);
    }, 200); // Slightly longer timeout to ensure auth state is loaded

    return () => clearTimeout(timer);
  }, [isAuthenticated, pathname, router]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Handle sidebar collapse on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper functions (these don't use hooks so they can be anywhere)
  const handleLogout = () => {
    // First clear the auth state
    logout();

    // Clear any other related storage items
    if (typeof window !== "undefined") {
      // Clear any related localStorage items
      localStorage.removeItem("pendingAdmin");
      sessionStorage.removeItem("bypass_department_check");

      console.log("Logging out and redirecting to login page");

      // Use location.href for a full page refresh to ensure clean state
      window.location.href = "/admin/login";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Navigation items
  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/admin/dashboard",
    },
    {
      name: "Events",
      href: "/admin/events",
      icon: Calendar,
      current:
        pathname.includes("/admin/events") && !pathname.includes("/categories"),
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tag,
      current: pathname.includes("/admin/categories"),
    },
    {
      name: "Nominees",
      href: "/admin/nominees",
      icon: Users,
      current: pathname.includes("/admin/nominees"),
    },
    {
      name: "Leaderboard",
      href: "/admin/leaderboard",
      icon: Trophy,
      current: pathname.includes("/admin/leaderboard"),
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: pathname.includes("/admin/analytics"),
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
      current: pathname.includes("/admin/payments"),
    },
    {
      name: "USSD",
      href: "/admin/ussdashboard",
      icon: Phone,
      current: pathname.includes("/admin/ussdashboard"),
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: UserCog,
      current: pathname.includes("/admin/profile"),
    },
    {
      name: "Department",
      href: "/admin/department",
      icon: Building,
      current: pathname.includes("/admin/department"),
    },
    {
      name: "Tutorials",
      href: "/admin/tutorials",
      icon: HelpCircle,
      current: pathname.includes("/admin/tutorials"),
    },
  ];

  // Skip layout for login, register, and verification-related pages
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/register" ||
    pathname === "/admin/verification-pending" ||
    pathname === "/admin/registration-success"
  ) {
    return <>{children}</>;
  }

  // If still loading or not authenticated and trying to access protected routes, show loading
  if (
    isLoading ||
    (isCreatingDepartment &&
      !sessionStorage.getItem("bypass_department_check")) ||
    (isDepartmentError && !sessionStorage.getItem("bypass_department_check")) ||
    (!isAuthenticated &&
      pathname !== "/admin/login" &&
      pathname !== "/admin/register")
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            {isCreatingDepartment
              ? "Setting Up Your Account"
              : isDepartmentError
                ? "Fixing Department Issue"
                : "Loading"}
          </h2>
          <p className="text-gray-500">
            {isCreatingDepartment
              ? "Creating department for your account..."
              : isDepartmentError
                ? "Resolving department configuration issue..."
                : "Please wait..."}
          </p>
          {(isCreatingDepartment || isDepartmentError) && (
            <div className="flex justify-center mt-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}

          {/* Add emergency fix button if department errors persist */}
          {isDepartmentError && (
            <div className="mt-6">
              <p className="text-sm text-amber-600 mb-2">
                If this issue persists, you can try our manual fix:
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => router.push("/admin/fix-department")}
              >
                Go to Department Fix Page
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile Header
  const mobileHeader = (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <Link
        href="/"
        className="text-2xl font-bold text-primary flex items-center lg:mb-8"
      >
        <img
          src="/Pollix icon.png"
          alt="Pollix"
          width="32"
          height="32"
          className="mr-2 rounded"
        />
        Pollix
      </Link>

      <div className="flex items-center space-x-2">
        <TutorialMenu className="mr-2" />
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
          aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isMobileSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );

  // Mobile Sidebar Overlay
  const mobileSidebar = isMobileSidebarOpen && (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
        onClick={() => setIsMobileSidebarOpen(false)}
      />
      <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <Link
            href="/"
            className="text-2xl font-bold text-primary flex items-center lg:mb-8"
          >
            <img
              src="/Pollix icon.png"
              alt="Pollix"
              width="32"
              height="32"
              className="mr-2 rounded"
            />
            Pollix
          </Link>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            aria-label="Close mobile menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  item.current
                    ? "bg-indigo-50 text-primary"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-primary"
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full group flex items-center rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-400" />
              Sign out
            </button>
          </div>
        </div>

        {/* User info in mobile sidebar */}
        {admin && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-indigo-100 text-primary font-medium">
                  {admin?.name ? getInitials(admin.name) : "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  {admin.name}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[180px]">
                  {admin.email}
                </p>
              </div>
            </div>
            {department && (
              <div className="mt-3 flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <div className="text-xs text-gray-500 truncate">
                  {department.name}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Desktop Sidebar
  const sidebar = (
    <aside
      className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:transition-all lg:duration-300 lg:ease-in-out lg:shadow-sm",
        isSidebarCollapsed ? "lg:w-20" : "lg:w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-gray-100 p-5",
          isSidebarCollapsed && "justify-center px-3"
        )}
      >
        <Link
          href="/"
          className={cn(
            "text-2xl font-bold text-primary flex items-center",
            isSidebarCollapsed && "justify-center"
          )}
        >
          <img
            src="/Pollix icon.png"
            alt="Pollix"
            width="32"
            height="32"
            className="mr-2 rounded"
          />
          {!isSidebarCollapsed && <>Pollix</>}
        </Link>

        {!isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="ml-auto rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="mt-2 w-full rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5 mx-auto" />
          </button>
        )}
      </div>

      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200",
              item.current
                ? "bg-indigo-50 text-primary shadow-sm"
                : "text-gray-700 hover:bg-indigo-50 hover:text-primary",
              isSidebarCollapsed ? "justify-center px-2 py-2" : "px-3 py-2"
            )}
            title={isSidebarCollapsed ? item.name : ""}
          >
            <item.icon
              className={cn(
                "h-5 w-5 flex-shrink-0",
                !isSidebarCollapsed && "mr-3"
              )}
            />
            {!isSidebarCollapsed && item.name}
          </Link>
        ))}

        <div className="pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors",
              isSidebarCollapsed ? "justify-center px-2 py-2" : "px-3 py-2"
            )}
            title={isSidebarCollapsed ? "Logout" : ""}
          >
            <LogOut
              className={cn(
                "h-5 w-5 flex-shrink-0",
                !isSidebarCollapsed && "mr-3"
              )}
            />
            {!isSidebarCollapsed && "Logout"}
          </button>
        </div>
      </nav>

      {department && !isSidebarCollapsed && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <div className="text-xs text-gray-500 truncate">
              {department?.name || "Department"}
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  // Desktop Header
  const desktopHeader = (
    <header className="hidden lg:flex bg-white border-b border-gray-100 h-16 items-center px-6 justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center">
        <h2 className="text-sm font-medium text-gray-700 flex items-center">
          {admin?.role === "super_admin" ? (
            <span className="flex items-center">
              <span className="h-2 w-2 bg-indigo-500 rounded-full mr-2"></span>
              Super Admin
            </span>
          ) : (
            <span className="flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
              Department Admin
            </span>
          )}
        </h2>
      </div>

      <div className="flex items-center">
        <div className="mr-6 text-gray-400 text-sm hidden md:block">
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <TutorialMenu className="mr-4" />
        <div className="flex items-center space-x-4 border-l border-gray-100 pl-4">
          <div className="text-sm font-medium text-gray-800 hidden md:block">
            {admin?.name}
          </div>
          <Avatar className="h-9 w-9 transition-transform hover:scale-105">
            <AvatarFallback className="bg-indigo-100 text-primary font-medium">
              {admin?.name ? getInitials(admin.name) : "AD"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {mobileHeader}
      {mobileSidebar}
      {sidebar}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          "pt-16 lg:pt-0", // Add top padding for mobile header
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {desktopHeader}
        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
      <WelcomeTutorial />
    </div>
  );
}
