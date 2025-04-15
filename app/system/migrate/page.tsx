"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";
import {
  DatabaseZap,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  ArrowLeft,
  Code,
} from "lucide-react";

export default function SystemMigrationPage() {
  // Migration states
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    totalAdmins?: number;
    updatedAdmins?: number;
    message?: string;
  } | null>(null);

  const [isRunningNomineeMigration, setIsRunningNomineeMigration] =
    useState(false);
  const [nomineeResult, setNomineeResult] = useState<{
    success?: boolean;
    totalNominees?: number;
    updatedNominees?: number;
    skippedNominees?: number;
    message?: string;
  } | null>(null);

  // New state for admin schema update migration
  const [isRunningSchemaUpdate, setIsRunningSchemaUpdate] = useState(false);
  const [schemaUpdateResult, setSchemaUpdateResult] = useState<{
    success?: boolean;
    totalAdmins?: number;
    updatedAdmins?: number;
    message?: string;
  } | null>(null);

  // SuperAdmin creation state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{
    success?: boolean;
    message?: string;
    adminId?: string;
  } | null>(null);

  // Get the migration functions
  const migrateAdmins = useMutation(api.migrations.migrateAdminRecords);
  const migrateNominees = useMutation(api.migrations.migrateNomineeRecords);
  const createSuperAdmin = useMutation(api.migrations.createSuperAdmin);
  const updateAdminSchema = useMutation(
    api.migrations.updateAdminSchemaWithRevocation
  );

  // Handler to run the admin migration
  const handleRunMigration = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const result = await migrateAdmins({});
      setResult(result);

      if (result.success) {
        toast.success("Admin migration completed successfully!");
      } else {
        toast.error("Admin migration failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during admin migration");
      setResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Handler to run the nominee code migration
  const handleRunNomineeMigration = async () => {
    setIsRunningNomineeMigration(true);
    setNomineeResult(null);

    try {
      const result = await migrateNominees({});
      setNomineeResult(result);

      if (result.success) {
        toast.success("Nominee code migration completed successfully!");
      } else {
        toast.error("Nominee code migration failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during nominee code migration");
      setNomineeResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsRunningNomineeMigration(false);
    }
  };

  // Handler to create superadmin
  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateResult(null);

    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      setIsCreating(false);
      return;
    }

    try {
      const result = await createSuperAdmin({
        email,
        password,
        name,
      });

      setCreateResult(result);

      if (result.success) {
        toast.success("Super admin account created successfully!");
        // Clear form
        setEmail("");
        setPassword("");
        setName("");
      } else {
        toast.error(result.message || "Failed to create super admin account");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating super admin");
      setCreateResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handler for the new admin schema update migration
  const handleRunSchemaUpdate = async () => {
    setIsRunningSchemaUpdate(true);
    setSchemaUpdateResult(null);

    try {
      const result = await updateAdminSchema({});
      setSchemaUpdateResult(result);

      if (result.success) {
        toast.success("Admin schema update completed successfully!");
      } else {
        toast.error("Admin schema update failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during admin schema update");
      setSchemaUpdateResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsRunningSchemaUpdate(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
          </Link>
        </div>
        <div className="text-2xl font-bold">
          <span className="bg-primary text-white p-1 rounded mr-1">e</span>
          <span className="text-gray-800">Vote</span>
          <span className="text-xs ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
            System Utilities
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <Alert className="bg-red-100 border-red-300 text-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle>System Migration Tools</AlertTitle>
              <AlertDescription>
                Use the tools below to fix schema issues and perform system-wide
                migrations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="migration" className="max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="migration">Admin Migration</TabsTrigger>
          <TabsTrigger value="schema-update">Schema Update</TabsTrigger>
          <TabsTrigger value="nominee-codes">Nominee Codes</TabsTrigger>
          <TabsTrigger value="superadmin">Create Super Admin</TabsTrigger>
        </TabsList>

        {/* Admin Migration Tab */}
        <TabsContent value="migration" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DatabaseZap className="h-6 w-6 text-primary" />
                <CardTitle>Admin Database Migration Tool</CardTitle>
              </div>
              <CardDescription>
                Update admin records to match the new schema with isVerified
                field
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  Running this migration will add the required{" "}
                  <code>isVerified</code> field to all admin records. Super
                  admins will be marked as verified, and regular admins will
                  need verification.
                </AlertDescription>
              </Alert>

              {result && (
                <Alert
                  className={
                    result.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>
                    {result.success
                      ? "Migration Successful"
                      : "Migration Failed"}
                  </AlertTitle>
                  <AlertDescription>
                    {result.message}
                    {result.success && (
                      <div className="mt-2 text-sm">
                        <div>Total admins: {result.totalAdmins}</div>
                        <div>Updated records: {result.updatedAdmins}</div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                onClick={handleRunMigration}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Running Migration...
                  </>
                ) : (
                  <>Run Admin Migration</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* New Schema Update Tab */}
        <TabsContent value="schema-update" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DatabaseZap className="h-6 w-6 text-purple-500" />
                <CardTitle>Admin Schema Update Tool</CardTitle>
              </div>
              <CardDescription>
                Update admin records to include revocation tracking fields
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  Running this migration will add the required revocation
                  tracking fields to admin records. This is needed to fix issues
                  with revoking admin verification.
                </AlertDescription>
              </Alert>

              {schemaUpdateResult && (
                <Alert
                  className={
                    schemaUpdateResult.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }
                >
                  {schemaUpdateResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>
                    {schemaUpdateResult.success
                      ? "Schema Update Successful"
                      : "Schema Update Failed"}
                  </AlertTitle>
                  <AlertDescription>
                    {schemaUpdateResult.message}
                    {schemaUpdateResult.success && (
                      <div className="mt-2 text-sm">
                        <div>
                          Total admins: {schemaUpdateResult.totalAdmins}
                        </div>
                        <div>
                          Updated records: {schemaUpdateResult.updatedAdmins}
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleRunSchemaUpdate}
                disabled={isRunningSchemaUpdate}
              >
                {isRunningSchemaUpdate ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating Schema...
                  </>
                ) : (
                  <>Run Schema Update</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Nominee Codes Migration Tab */}
        <TabsContent value="nominee-codes" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Code className="h-6 w-6 text-indigo-600" />
                <CardTitle>Nominee Codes Generator</CardTitle>
              </div>
              <CardDescription>
                Generate USSD integration codes for all nominees
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>USSD Integration Codes</AlertTitle>
                <AlertDescription>
                  This migration will generate unique codes for all nominees in
                  the system. Each code will start with the department
                  abbreviation (e.g., CS for Computer Science) followed by a
                  3-digit number (e.g., CS001).
                </AlertDescription>
              </Alert>

              {nomineeResult && (
                <Alert
                  className={
                    nomineeResult.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }
                >
                  {nomineeResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>
                    {nomineeResult.success
                      ? "Code Generation Successful"
                      : "Code Generation Failed"}
                  </AlertTitle>
                  <AlertDescription>
                    {nomineeResult.message}
                    {nomineeResult.success && (
                      <div className="mt-2 text-sm">
                        <div>Total nominees: {nomineeResult.totalNominees}</div>
                        <div>
                          Updated nominees: {nomineeResult.updatedNominees}
                        </div>
                        <div>
                          Skipped nominees: {nomineeResult.skippedNominees}
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={handleRunNomineeMigration}
                disabled={isRunningNomineeMigration}
              >
                {isRunningNomineeMigration ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating Codes...
                  </>
                ) : (
                  <>Generate Nominee Codes</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Super Admin Creation Tab */}
        <TabsContent value="superadmin" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <UserPlus className="h-6 w-6 text-blue-600" />
                <CardTitle>Create Super Admin Account</CardTitle>
              </div>
              <CardDescription>
                Create a new super admin account to manage the system
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Super Admin Privileges</AlertTitle>
                <AlertDescription>
                  A Super Admin account has the highest level of access in the
                  system. This account will be able to verify other
                  administrators and manage all system settings.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Super Admin Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="superadmin@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Use a strong password with at least 8 characters, including
                    numbers and special characters.
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
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertTitle>
                      {createResult.success
                        ? "Account Created"
                        : "Creation Failed"}
                    </AlertTitle>
                    <AlertDescription>
                      {createResult.message}
                      {createResult.success && (
                        <div className="mt-2">
                          <p className="text-sm">
                            You can now log in using the provided email and
                            password at the{" "}
                            <a
                              href="/superadmin/login"
                              className="text-blue-600 hover:underline"
                            >
                              Super Admin Login
                            </a>
                          </p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>Create Super Admin Account</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Instructions */}
      <Card className="max-w-2xl mx-auto mt-6">
        <CardHeader>
          <CardTitle className="text-lg">System Migration Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p className="font-medium">System Migrations:</p>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-800">
                  Admin Verification Migration
                </p>
                <p className="text-gray-600">
                  Adds the required{" "}
                  <code className="text-red-600 bg-red-50 px-1 rounded">
                    isVerified
                  </code>{" "}
                  field to admin accounts.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-800">
                  Nominee Codes Migration
                </p>
                <p className="text-gray-600">
                  Generates unique USSD codes for all nominees based on their
                  department abbreviation.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-800">
                  Super Admin Creation
                </p>
                <p className="text-gray-600">
                  Creates a new super admin account with full system privileges.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-center">
              After running necessary migrations, proceed to{" "}
              <a
                href="/superadmin/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Super Admin dashboard
              </a>{" "}
              or{" "}
              <a
                href="/admin/login"
                className="text-primary hover:underline font-medium"
              >
                Department Admin dashboard
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
