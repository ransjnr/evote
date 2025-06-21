"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Database,
  Settings,
  Users,
  RefreshCw,
  Terminal,
  AlertTriangle,
  CheckCircle,
  Play,
  Shield,
  Code,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function SuperAdminSystemPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Mutations
  const migrateAdminRecords = useMutation(api.migrations.migrateAdminRecords);
  const migrateNomineeRecords = useMutation(
    api.migrations.migrateNomineeRecords
  );
  const addDeletionFieldsToAdmins = useMutation(
    api.migrations.addDeletionFieldsToAdmins
  );
  const initializeSystemSettings = useMutation(
    api.migrations.initializeSystemSettings
  );
  const updateAdminSchemaWithRevocation = useMutation(
    api.migrations.updateAdminSchemaWithRevocation
  );

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

  const systemActions = [
    {
      id: "migrate-admins",
      title: "Migrate Admin Records",
      description: "Add missing isVerified fields to existing admin records",
      icon: Users,
      category: "Migration",
      danger: false,
      action: async () => {
        const result = await migrateAdminRecords({});
        toast.success(result.message);
        return result;
      },
    },
    {
      id: "migrate-nominees",
      title: "Migrate Nominee Records",
      description: "Generate codes for nominees that don't have them",
      icon: Code,
      category: "Migration",
      danger: false,
      action: async () => {
        const result = await migrateNomineeRecords({});
        toast.success(result.message);
        return result;
      },
    },
    {
      id: "add-deletion-fields",
      title: "Add Deletion Fields",
      description: "Add deletion tracking fields to admin records",
      icon: Database,
      category: "Migration",
      danger: false,
      action: async () => {
        const result = await addDeletionFieldsToAdmins();
        toast.success(`Processed ${result.processedCount} admin records`);
        return result;
      },
    },
    {
      id: "update-revocation-schema",
      title: "Update Revocation Schema",
      description: "Add revocation fields to admin schema",
      icon: Shield,
      category: "Migration",
      danger: false,
      action: async () => {
        const result = await updateAdminSchemaWithRevocation({});
        toast.success(result.message);
        return result;
      },
    },
    {
      id: "initialize-settings",
      title: "Initialize System Settings",
      description: "Create default system configuration settings",
      icon: Settings,
      category: "Setup",
      danger: false,
      action: async () => {
        const result = await initializeSystemSettings();
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
        return result;
      },
    },
  ];

  const handleRunAction = async (actionId: string) => {
    const action = systemActions.find((a) => a.id === actionId);
    if (!action) return;

    setIsRunning(true);
    try {
      await action.action();
    } catch (error: any) {
      toast.error(error.message || `Failed to run ${action.title}`);
    } finally {
      setIsRunning(false);
      setIsConfirmDialogOpen(false);
      setSelectedAction(null);
    }
  };

  const openConfirmDialog = (actionId: string) => {
    setSelectedAction(actionId);
    setIsConfirmDialogOpen(true);
  };

  const selectedActionData = systemActions.find((a) => a.id === selectedAction);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            System Management
          </h1>
          <p className="text-gray-500 mt-1">
            Run system migrations and manage platform operations
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Warning: System Operations
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              These operations modify database records and should only be run
              when necessary. Some operations are designed to be run once during
              system setup or updates. Always ensure you have proper backups
              before running migrations.
            </p>
          </div>
        </div>
      </div>

      {/* Group actions by category */}
      {["Migration", "Setup"].map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {category === "Migration" ? (
                <Database className="h-5 w-5 mr-2 text-blue-600" />
              ) : (
                <Settings className="h-5 w-5 mr-2 text-green-600" />
              )}
              {category} Operations
            </CardTitle>
            <CardDescription>
              {category === "Migration"
                ? "Database schema migrations and data transformations"
                : "System setup and configuration operations"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemActions
                .filter((action) => action.category === category)
                .map((action) => (
                  <Card
                    key={action.id}
                    className="border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`mt-1 p-2 rounded-lg ${
                              action.danger
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <action.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {action.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {action.description}
                            </p>
                            <div className="mt-2">
                              <Badge
                                variant={
                                  action.danger ? "destructive" : "outline"
                                }
                                className="text-xs"
                              >
                                {action.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant={action.danger ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => openConfirmDialog(action.id)}
                          disabled={isRunning}
                          className="ml-4"
                        >
                          {isRunning ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              {selectedActionData?.icon && (
                <selectedActionData.icon className="h-5 w-5 mr-2" />
              )}
              Run {selectedActionData?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedActionData?.description}
              <br />
              <br />
              <div
                className={`border rounded-md p-3 mt-3 ${
                  selectedActionData?.danger
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start">
                  {selectedActionData?.danger ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Terminal className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  )}
                  <div
                    className={`text-sm ${
                      selectedActionData?.danger
                        ? "text-red-800"
                        : "text-blue-800"
                    }`}
                  >
                    {selectedActionData?.danger ? (
                      <>
                        <strong>Danger:</strong> This operation can permanently
                        modify or delete data. Make sure you understand the
                        consequences before proceeding.
                      </>
                    ) : (
                      <>
                        <strong>Info:</strong> This operation will modify
                        database records. It's generally safe but should only be
                        run when necessary.
                      </>
                    )}
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRunning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedAction && handleRunAction(selectedAction)}
              disabled={isRunning}
              className={
                selectedActionData?.danger ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Operation
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
