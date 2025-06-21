"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UserCheck,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Shield,
  Calendar,
  Building,
  Clock,
  Trash2,
  RotateCcw,
  Ban,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatDistanceToNow } from "date-fns";

export default function AdminVerificationPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] =
    useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Get pending admin verifications
  const pendingVerifications = useQuery(api.auth.getPendingAdminVerifications);

  // Get all admins (including deleted ones for super admin view)
  const allAdmins = useQuery(api.auth.getAllAdmins);

  // Get departments to display department names
  const departments = useQuery(api.departments.listDepartments);

  // Mutations for verification actions
  const verifyAdmin = useMutation(api.auth.verifyAdminAccount);
  const revokeVerification = useMutation(api.auth.revokeAdminVerification);
  const deleteAdmin = useMutation(api.auth.deleteAdminAccount);
  const restoreAdmin = useMutation(api.auth.restoreAdminAccount);
  const permanentlyDeleteAdmin = useMutation(
    api.auth.permanentlyDeleteAdminAccount
  );

  // For pending verification count
  const pendingCount = pendingVerifications?.length || 0;
  const verifiedCount = allAdmins
    ? allAdmins.filter((a) => a.isVerified && !a.isDeleted).length
    : 0;
  const deletedCount = allAdmins
    ? allAdmins.filter((a) => a.isDeleted).length
    : 0;

  // Filter admins by status
  const activeAdmins = allAdmins?.filter((a) => !a.isDeleted) || [];
  const deletedAdmins = allAdmins?.filter((a) => a.isDeleted) || [];

  // Guard for super admin access
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

  // Find department name by slug
  const getDepartmentName = (departmentSlug: string) => {
    if (!departments) return departmentSlug;
    const department = departments.find((d) => d.slug === departmentSlug);
    return department ? department.name : departmentSlug;
  };

  // Handler for account verification
  const handleVerifyAccount = async () => {
    if (!selectedAdmin || !admin) return;

    setIsVerifying(true);
    try {
      await verifyAdmin({
        adminId: selectedAdmin._id,
        superAdminId: admin._id as any,
      });

      toast.success(
        `${selectedAdmin.name}'s account has been verified successfully.`
      );
      setIsVerifyDialogOpen(false);
    } catch (error: any) {
      toast.error(`Verification failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler for revoking verification
  const handleRevokeVerification = async () => {
    if (!selectedAdmin || !admin) return;

    setIsVerifying(true);
    try {
      await revokeVerification({
        adminId: selectedAdmin._id,
        superAdminId: admin._id as any,
      });

      toast.success(
        `Verification has been revoked for ${selectedAdmin.name}'s account.`
      );
      setIsRevokeDialogOpen(false);
    } catch (error: any) {
      toast.error(`Revocation failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler for deleting admin account
  const handleDeleteAccount = async () => {
    if (!selectedAdmin || !admin) return;

    setIsVerifying(true);
    try {
      await deleteAdmin({
        adminId: selectedAdmin._id,
        superAdminId: admin._id as any,
      });

      toast.success(
        `${selectedAdmin.name}'s account has been deleted successfully.`
      );
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(`Deletion failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler for restoring admin account
  const handleRestoreAccount = async () => {
    if (!selectedAdmin || !admin) return;

    setIsVerifying(true);
    try {
      await restoreAdmin({
        adminId: selectedAdmin._id,
        superAdminId: admin._id as any,
      });

      toast.success(
        `${selectedAdmin.name}'s account has been restored successfully.`
      );
      setIsRestoreDialogOpen(false);
    } catch (error: any) {
      toast.error(`Restoration failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler for permanently deleting admin account
  const handlePermanentlyDeleteAccount = async () => {
    if (!selectedAdmin || !admin) return;

    setIsVerifying(true);
    try {
      await permanentlyDeleteAdmin({
        adminId: selectedAdmin._id,
        superAdminId: admin._id as any,
      });

      toast.success(
        `${selectedAdmin.name}'s account and all associated data has been permanently deleted.`
      );
      setIsPermanentDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(
        `Permanent deletion failed: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Verification
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and verify administrator accounts
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">
                    Active Admins
                  </div>
                  <div className="text-2xl font-bold">
                    {activeAdmins?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">
                    Deleted Admins
                  </div>
                  <div className="text-2xl font-bold">{deletedCount}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">
                    Verified Accounts
                  </div>
                  <div className="text-2xl font-bold">{verifiedCount}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">
                    Pending Verification
                  </div>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert when there are pending verifications */}
      {pendingCount > 0 && (
        <Alert
          variant="default"
          className="bg-amber-50 border-amber-200 text-amber-800"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            There {pendingCount === 1 ? "is" : "are"} {pendingCount} admin
            account{pendingCount === 1 ? "" : "s"} awaiting your verification.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="relative">
            Pending Verification
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-amber-100 text-amber-700 border-amber-200 absolute -top-2 -right-2">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">
            Active Administrators ({activeAdmins.length})
          </TabsTrigger>
          <TabsTrigger value="deleted">
            Deleted Administrators ({deletedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            {pendingVerifications && pendingVerifications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVerifications.map((adminUser) => (
                    <TableRow key={adminUser._id}>
                      <TableCell className="font-medium">
                        {adminUser.name}
                      </TableCell>
                      <TableCell>{adminUser.email}</TableCell>
                      <TableCell>
                        {getDepartmentName(adminUser.departmentId)}
                      </TableCell>
                      <TableCell>
                        {formatTimestamp(adminUser.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2 bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                          onClick={() => {
                            setSelectedAdmin(adminUser);
                            setIsVerifyDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <CardContent className="py-10">
                <div className="text-center">
                  <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    All caught up!
                  </h3>
                  <p className="mt-1 text-gray-500">
                    There are no pending admin verifications at this time.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            {activeAdmins && activeAdmins.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAdmins.map((adminUser) => (
                    <TableRow key={adminUser._id}>
                      <TableCell className="font-medium">
                        {adminUser.name}
                      </TableCell>
                      <TableCell>{adminUser.email}</TableCell>
                      <TableCell>
                        {adminUser.role === "super_admin" ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Super Admin
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                            <User className="h-3 w-3 mr-1" />
                            Department Admin
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getDepartmentName(adminUser.departmentId)}
                      </TableCell>
                      <TableCell>
                        {adminUser.isVerified ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {adminUser.role !== "super_admin" && (
                          <div className="flex gap-2 justify-end">
                            {adminUser.isVerified ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                onClick={() => {
                                  setSelectedAdmin(adminUser);
                                  setIsRevokeDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Revoke
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                onClick={() => {
                                  setSelectedAdmin(adminUser);
                                  setIsVerifyDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                              onClick={() => {
                                setSelectedAdmin(adminUser);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <CardContent className="py-10">
                <div className="text-center">
                  <Users className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No active administrators found
                  </h3>
                  <p className="mt-1 text-gray-500">
                    There are no active administrator accounts in the system.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="deleted">
          <Card>
            {deletedAdmins && deletedAdmins.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Deleted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedAdmins.map((adminUser) => (
                    <TableRow key={adminUser._id} className="opacity-70">
                      <TableCell className="font-medium">
                        {adminUser.name}
                      </TableCell>
                      <TableCell>{adminUser.email}</TableCell>
                      <TableCell>
                        {adminUser.role === "super_admin" ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Super Admin
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                            <User className="h-3 w-3 mr-1" />
                            Department Admin
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getDepartmentName(adminUser.departmentId)}
                      </TableCell>
                      <TableCell>
                        {adminUser.deletedAt && (
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(adminUser.deletedAt)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                            onClick={() => {
                              setSelectedAdmin(adminUser);
                              setIsRestoreDialogOpen(true);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            onClick={() => {
                              setSelectedAdmin(adminUser);
                              setIsPermanentDeleteDialogOpen(true);
                            }}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Permanent Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <CardContent className="py-10">
                <div className="text-center">
                  <Trash2 className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No deleted administrators
                  </h3>
                  <p className="mt-1 text-gray-500">
                    There are no deleted administrator accounts.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verify Admin Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Administrator Account</DialogTitle>
            <DialogDescription>
              You are about to verify the following administrator account. This
              will grant them access to the admin portal.
            </DialogDescription>
          </DialogHeader>

          {selectedAdmin && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">
                    {selectedAdmin.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedAdmin.email}
                  </div>
                  <div className="mt-1 flex items-center">
                    <Building className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {getDepartmentName(selectedAdmin.departmentId)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      Registered {formatTimestamp(selectedAdmin.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsVerifyDialogOpen(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleVerifyAccount}
              disabled={isVerifying}
            >
              {isVerifying ? (
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
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Verification Dialog */}
      <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Revoke Verification
            </DialogTitle>
            <DialogDescription>
              You are about to revoke verification for the following
              administrator account. This will block their access to the admin
              portal until they are verified again.
            </DialogDescription>
          </DialogHeader>

          {selectedAdmin && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">
                    {selectedAdmin.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedAdmin.email}
                  </div>
                  <div className="mt-1 flex items-center">
                    <Building className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {getDepartmentName(selectedAdmin.departmentId)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsRevokeDialogOpen(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeVerification}
              disabled={isVerifying}
            >
              {isVerifying ? (
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
                  Revoking...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Revoke Access
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Delete Administrator Account
            </DialogTitle>
            <DialogDescription>
              You are about to delete the following administrator account. This
              will permanently remove their access to the admin portal.
            </DialogDescription>
          </DialogHeader>

          {selectedAdmin && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">
                    {selectedAdmin.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedAdmin.email}
                  </div>
                  <div className="mt-1 flex items-center">
                    <Building className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {getDepartmentName(selectedAdmin.departmentId)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isVerifying}
            >
              {isVerifying ? (
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
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Admin Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              Restore Administrator Account
            </DialogTitle>
            <DialogDescription>
              You are about to restore the following administrator account. This
              will grant them access to the admin portal.
            </DialogDescription>
          </DialogHeader>

          {selectedAdmin && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <RotateCcw className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">
                    {selectedAdmin.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedAdmin.email}
                  </div>
                  <div className="mt-1 flex items-center">
                    <Building className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {getDepartmentName(selectedAdmin.departmentId)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsRestoreDialogOpen(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleRestoreAccount}
              disabled={isVerifying}
            >
              {isVerifying ? (
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
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Admin Dialog */}
      <Dialog
        open={isPermanentDeleteDialogOpen}
        onOpenChange={setIsPermanentDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Permanently Delete Administrator Account
            </DialogTitle>
            <DialogDescription>
              You are about to permanently delete the following administrator
              account. This will permanently remove their access to the admin
              portal and all associated data.
            </DialogDescription>
          </DialogHeader>

          {selectedAdmin && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Ban className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">
                    {selectedAdmin.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedAdmin.email}
                  </div>
                  <div className="mt-1 flex items-center">
                    <Building className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {getDepartmentName(selectedAdmin.departmentId)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsPermanentDeleteDialogOpen(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePermanentlyDeleteAccount}
              disabled={isVerifying}
            >
              {isVerifying ? (
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
                  Deleting...
                </>
              ) : (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Permanently Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
