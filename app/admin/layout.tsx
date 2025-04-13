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
} from "lucide-react";
import { toast } from "sonner";
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isAuthenticated, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [departmentCreated, setDepartmentCreated] = useState(false);

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
        department === undefined &&
        !isCreatingDepartment &&
        !departmentCreated &&
        allDepartments !== undefined // Make sure we've loaded all departments
      ) {
        // Check if any department with this slug already exists
        const existingDepartment = allDepartments.find(
          (dept) => dept.slug === admin.departmentId
        );

        if (!existingDepartment) {
          setIsCreatingDepartment(true);

          try {
            const result = await createDepartment({
              name: "Auto-Created Department",
              description: "Auto-created to fix missing department issue",
              slug: admin.departmentId,
              adminId: admin._id,
            });

            if (result.success) {
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
            toast.error(error.message || "Failed to create department");
          } finally {
            setIsCreatingDepartment(false);
          }
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
    const publicRoutes = ["/admin/login", "/admin/register"];

    // Give browser time to rehydrate the Zustand store from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        router.push("/admin/login");
      }
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, pathname, router]);

  // Skip layout for login and register pages
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    return <>{children}</>;
  }

  // If still loading or not authenticated and trying to access protected routes, show loading
  if (
    isLoading ||
    isCreatingDepartment || // Also show loading when creating department
    isDepartmentError || // Show loading when department has an error and we're trying to fix it
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
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center">
          <Link
            href="/admin/dashboard"
            className="text-xl font-bold text-primary flex items-center"
          >
            <span className="bg-primary text-white p-1 rounded mr-1">e</span>
            Vote
            <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-xs text-primary rounded-full">
              Admin
            </span>
          </Link>
        </div>

        <nav className="p-4 space-y-7 flex-1 overflow-y-auto">
          <div className="space-y-1.5">
            <Link href="/admin/dashboard">
              <Button
                variant={
                  pathname === "/admin/dashboard" ? "secondary" : "ghost"
                }
                className={`w-full justify-start rounded-lg text-sm font-medium hover:bg-indigo-50 ${
                  pathname === "/admin/dashboard"
                    ? "bg-indigo-50 text-primary shadow-sm hover:bg-indigo-100"
                    : "text-gray-700"
                }`}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/events">
              <Button
                variant={
                  pathname.includes("/admin/events") &&
                  !pathname.includes("/categories")
                    ? "secondary"
                    : "ghost"
                }
                className={`w-full justify-start rounded-lg text-sm font-medium hover:bg-indigo-50 ${
                  pathname.includes("/admin/events") &&
                  !pathname.includes("/categories")
                    ? "bg-indigo-50 text-primary shadow-sm hover:bg-indigo-100"
                    : "text-gray-700"
                }`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Events
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button
                variant={
                  pathname.includes("/admin/categories") ? "secondary" : "ghost"
                }
                className={`w-full justify-start rounded-lg text-sm font-medium hover:bg-indigo-50 ${
                  pathname.includes("/admin/categories")
                    ? "bg-indigo-50 text-primary shadow-sm hover:bg-indigo-100"
                    : "text-gray-700"
                }`}
              >
                <Tag className="mr-2 h-4 w-4" />
                Categories
              </Button>
            </Link>
            <Link href="/admin/nominees">
              <Button
                variant={
                  pathname.includes("/admin/nominees") ? "secondary" : "ghost"
                }
                className={`w-full justify-start rounded-lg text-sm font-medium hover:bg-indigo-50 ${
                  pathname.includes("/admin/nominees")
                    ? "bg-indigo-50 text-primary shadow-sm hover:bg-indigo-100"
                    : "text-gray-700"
                }`}
              >
                <Users className="mr-2 h-4 w-4" />
                Nominees
              </Button>
            </Link>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs uppercase text-gray-400 font-semibold mb-3 pl-3">
              Analytics
            </p>
            <Link href="/admin/leaderboard">
              <Button
                variant={
                  pathname.includes("/admin/leaderboard")
                    ? "secondary"
                    : "ghost"
                }
                className={`w-full justify-start rounded-lg text-sm font-medium hover:bg-indigo-50 ${
                  pathname.includes("/admin/leaderboard")
                    ? "bg-indigo-50 text-primary shadow-sm hover:bg-indigo-100"
                    : "text-gray-700"
                }`}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button
                variant={
                  pathname.includes("/admin/analytics") ? "secondary" : "ghost"
                }
                className={`w-full justify-start rounded-lg text-sm font-medium hover:bg-indigo-50 ${
                  pathname.includes("/admin/analytics")
                    ? "bg-indigo-50 text-primary shadow-sm hover:bg-indigo-100"
                    : "text-gray-700"
                }`}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Results
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button
                variant={
                  pathname.includes("/admin/payments") ? "secondary" : "ghost"
                }
                className={`w-full justify-start rounded-lg text-sm font-medium hover:bg-indigo-50 ${
                  pathname.includes("/admin/payments")
                    ? "bg-indigo-50 text-primary shadow-sm hover:bg-indigo-100"
                    : "text-gray-700"
                }`}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Payments
              </Button>
            </Link>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs uppercase text-gray-400 font-semibold mb-3 pl-3">
              Settings
            </p>
            <Link href="/admin/profile">
              <Button
                variant={
                  pathname.includes("/admin/profile") ? "secondary" : "ghost"
                }
                className={`w-full justify-start rounded-lg text-sm font-medium hover:bg-indigo-50 ${
                  pathname.includes("/admin/profile")
                    ? "bg-indigo-50 text-primary shadow-sm hover:bg-indigo-100"
                    : "text-gray-700"
                }`}
              >
                <UserCog className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Link href="/admin/department">
              <Button
                variant={
                  pathname.includes("/admin/department") ? "secondary" : "ghost"
                }
                className={`w-full justify-start rounded-lg text-sm font-medium hover:bg-indigo-50 ${
                  pathname.includes("/admin/department")
                    ? "bg-indigo-50 text-primary shadow-sm hover:bg-indigo-100"
                    : "text-gray-700"
                }`}
              >
                <Building className="mr-2 h-4 w-4" />
                Department
              </Button>
            </Link>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </nav>

        {department && (
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header bar */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6 justify-between sticky top-0 z-10 shadow-sm">
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
            <div className="mr-6 text-gray-400 text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center space-x-4 border-l border-gray-100 pl-4">
              <div className="text-sm font-medium text-gray-800">
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

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
