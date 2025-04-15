"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  Users,
  Building,
  Calendar,
  Activity,
  Shield,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { admin } = useAuthStore();

  // Get all admins to count them
  const allAdmins = useQuery(api.auth.getAllAdmins);

  // Get pending verifications
  const pendingVerifications = useQuery(api.auth.getPendingAdminVerifications);

  // Get departments
  const departments = useQuery(api.departments.listDepartments);

  // Stats calculations
  const totalAdmins = allAdmins?.length || 0;
  const pendingAdminCount = pendingVerifications?.length || 0;
  const departmentCount = departments?.length || 0;
  const verifiedAdmins = totalAdmins - pendingAdminCount;

  // Navigation functions
  const navigateToVerifications = () => {
    router.push("/superadmin/admin-verification");
  };

  const navigateToDepartments = () => {
    router.push("/superadmin/departments");
  };

  if (!admin || admin.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Access Restricted
            </CardTitle>
            <CardDescription className="text-center">
              You need super admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/superadmin/login")}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {admin.name} • System Overview
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
          >
            <Shield className="h-3.5 w-3.5 mr-1" />
            Super Admin
          </Badge>
        </div>
      </div>

      {/* Alert for pending verifications */}
      {pendingAdminCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <span>
              <strong>{pendingAdminCount}</strong> admin account
              {pendingAdminCount !== 1 ? "s" : ""} pending verification
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-amber-700 border-amber-200 hover:bg-amber-100"
            onClick={navigateToVerifications}
          >
            Review Now
          </Button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Administrators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary/80 mr-3" />
              <div>
                <div className="text-2xl font-bold">{totalAdmins}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {verifiedAdmins} verified, {pendingAdminCount} pending
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-indigo-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {pendingAdminCount}
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    {pendingAdminCount === 1 ? "account" : "accounts"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Awaiting your review
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{departmentCount}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Active organizational units
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">Active</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  All systems operational
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="bg-white border h-24 flex-col justify-center items-center transition-all hover:bg-blue-50 hover:border-blue-200"
            onClick={navigateToVerifications}
          >
            <UserCheck className="h-6 w-6 text-indigo-600 mb-2" />
            <div className="text-sm font-medium">Verify Administrators</div>
          </Button>

          <Button
            variant="outline"
            className="bg-white border h-24 flex-col justify-center items-center transition-all hover:bg-blue-50 hover:border-blue-200"
            onClick={navigateToDepartments}
          >
            <Building className="h-6 w-6 text-blue-600 mb-2" />
            <div className="text-sm font-medium">Manage Departments</div>
          </Button>

          <Button
            variant="outline"
            className="bg-white border h-24 flex-col justify-center items-center transition-all hover:bg-blue-50 hover:border-blue-200"
            onClick={() => router.push("/superadmin/settings")}
          >
            <Shield className="h-6 w-6 text-green-600 mb-2" />
            <div className="text-sm font-medium">System Settings</div>
          </Button>
        </div>
      </div>

      {/* Recent Admin Activity - A placeholder for future implementation */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Admin Registrations</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={navigateToVerifications}
          >
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <Card className="bg-white">
          <CardContent className="p-0">
            {pendingVerifications && pendingVerifications.length > 0 ? (
              <div className="divide-y">
                {pendingVerifications.slice(0, 5).map((admin) => (
                  <div
                    key={admin._id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">{admin.name}</div>
                        <div className="text-xs text-gray-500">
                          {admin.email}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                      Pending Verification
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No pending admin verifications
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
