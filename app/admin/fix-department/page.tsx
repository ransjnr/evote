"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FixDepartmentPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentSlug, setDepartmentSlug] = useState("");
  const [createResult, setCreateResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const { admin, logout } = useAuthStore();
  const createDepartment = useMutation(api.departments.createDepartment);

  // Fetch all departments
  const allDepartments = useQuery(api.departments.listDepartments) || [];

  // Check if department exists for current admin
  const departmentExists = admin?.departmentId
    ? allDepartments.some((dept) => dept.slug === admin.departmentId)
    : false;

  // Initialize department slug from admin
  useEffect(() => {
    if (admin?.departmentId) {
      setDepartmentSlug(admin.departmentId);
      setDepartmentName(`Department for ${admin.name}`);
    }
  }, [admin]);

  // Handle form submission
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) {
      toast.error("You must be logged in to create a department");
      return;
    }

    setIsCreating(true);
    setCreateResult(null);

    try {
      const result = await createDepartment({
        name: departmentName,
        description: "Created to fix department issue",
        slug: departmentSlug,
        adminId: admin._id,
      });

      if (result.success) {
        setCreateResult({
          success: true,
          message: "Department created successfully!",
        });

        toast.success("Department created successfully!");

        // Clear any bypass flags that might have been set
        sessionStorage.removeItem("bypass_department_check");

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Failed to create department:", error);
      setCreateResult({
        success: false,
        message: error.message || "Failed to create department",
      });
      toast.error(error.message || "Failed to create department");
    } finally {
      setIsCreating(false);
    }
  };

  if (!admin) {
    return (
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this page.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/admin/login")}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fix Department Configuration</CardTitle>
          <CardDescription>
            This utility helps resolve issues with missing departments for your
            admin account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className={departmentExists ? "bg-green-50" : "bg-amber-50"}>
            {departmentExists ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            <AlertTitle>
              {departmentExists
                ? "Department Configuration OK"
                : "Department Configuration Issue"}
            </AlertTitle>
            <AlertDescription>
              {departmentExists
                ? `Your account is linked to department slug "${admin?.departmentId}" which exists in the database.`
                : `Your account is linked to department slug "${admin?.departmentId}" which does not exist in the database.`}
            </AlertDescription>
          </Alert>

          {!departmentExists && (
            <form onSubmit={handleCreateDepartment}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input
                    id="departmentName"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="Enter department name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentSlug">
                    Department Slug (matches your admin account)
                  </Label>
                  <Input
                    id="departmentSlug"
                    value={departmentSlug}
                    onChange={(e) => setDepartmentSlug(e.target.value)}
                    placeholder="Enter department slug"
                    required
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    This value is from your admin account and cannot be changed
                  </p>
                </div>

                {createResult && (
                  <Alert
                    className={
                      createResult.success
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }
                  >
                    {createResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <AlertTitle>
                      {createResult.success ? "Success" : "Error"}
                    </AlertTitle>
                    <AlertDescription>{createResult.message}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating || departmentExists}
                >
                  {isCreating ? "Creating Department..." : "Create Department"}
                </Button>
              </div>
            </form>
          )}

          {departmentExists && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Your department configuration appears correct. If you're still
                experiencing issues, try the following:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Log out and log back in</li>
              </ul>
              <Button
                onClick={() => router.push("/admin/dashboard")}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/dashboard")}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              logout();
              router.push("/admin/login");
            }}
          >
            Log Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
