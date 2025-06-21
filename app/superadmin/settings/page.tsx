"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Database,
  Mail,
  CreditCard,
  Vote,
  Shield,
  Eye,
  EyeOff,
  Activity,
  Users,
  Building,
  Calendar,
  Ticket,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatDistanceToNow } from "date-fns";

const SETTING_CATEGORIES = {
  general: {
    icon: Settings,
    label: "General",
    color: "bg-blue-100 text-blue-600",
  },
  voting: { icon: Vote, label: "Voting", color: "bg-green-100 text-green-600" },
  payment: {
    icon: CreditCard,
    label: "Payment",
    color: "bg-purple-100 text-purple-600",
  },
  email: { icon: Mail, label: "Email", color: "bg-orange-100 text-orange-600" },
  features: {
    icon: Shield,
    label: "Features",
    color: "bg-red-100 text-red-600",
  },
};

export default function SuperAdminSettingsPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSetting, setSelectedSetting] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecretValues, setShowSecretValues] = useState<
    Record<string, boolean>
  >({});

  // Form state
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
    category: "general",
    isPublic: false,
  });

  // Get all settings grouped by category
  const allSettings = useQuery(api.systemSettings.getAllSettings) || {};

  // Get system statistics
  const systemStats = useQuery(api.systemSettings.getSystemStats);

  // Mutations
  const setSetting = useMutation(api.systemSettings.setSetting);
  const deleteSetting = useMutation(api.systemSettings.deleteSetting);
  const initializeDefaultSettings = useMutation(
    api.systemSettings.initializeDefaultSettings
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

  const formatSettingValue = (value: any, isSecret: boolean = false) => {
    if (isSecret && !showSecretValues[selectedSetting?.key]) {
      return "••••••••";
    }

    if (typeof value === "boolean") {
      return value ? "Enabled" : "Disabled";
    }
    if (typeof value === "number") {
      return value.toString();
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return value?.toString() || "";
  };

  const isSecretSetting = (key: string) => {
    return (
      key.includes("password") || key.includes("secret") || key.includes("key")
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    if (!formData.key.trim() || !formData.category.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let processedValue = formData.value;

      // Try to parse as JSON if it looks like an object/array
      if (formData.value.startsWith("{") || formData.value.startsWith("[")) {
        try {
          processedValue = JSON.parse(formData.value);
        } catch {
          // Keep as string if not valid JSON
        }
      }
      // Parse boolean values
      else if (formData.value.toLowerCase() === "true") {
        processedValue = true;
      } else if (formData.value.toLowerCase() === "false") {
        processedValue = false;
      }
      // Parse numeric values
      else if (!isNaN(Number(formData.value)) && formData.value.trim() !== "") {
        processedValue = Number(formData.value);
      }

      const result = await setSetting({
        key: formData.key.trim(),
        value: processedValue,
        description: formData.description.trim() || undefined,
        category: formData.category,
        isPublic: formData.isPublic,
        superAdminId: admin._id as any,
      });

      toast.success(`Setting ${result.action} successfully!`);
      setIsCreateDialogOpen(false);
      setFormData({
        key: "",
        value: "",
        description: "",
        category: "general",
        isPublic: false,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to save setting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSetting || !admin) return;

    setIsSubmitting(true);
    try {
      let processedValue = formData.value;

      // Try to parse as JSON if it looks like an object/array
      if (formData.value.startsWith("{") || formData.value.startsWith("[")) {
        try {
          processedValue = JSON.parse(formData.value);
        } catch {
          // Keep as string if not valid JSON
        }
      }
      // Parse boolean values
      else if (formData.value.toLowerCase() === "true") {
        processedValue = true;
      } else if (formData.value.toLowerCase() === "false") {
        processedValue = false;
      }
      // Parse numeric values
      else if (!isNaN(Number(formData.value)) && formData.value.trim() !== "") {
        processedValue = Number(formData.value);
      }

      await setSetting({
        key: selectedSetting.key,
        value: processedValue,
        description: formData.description.trim() || undefined,
        category: formData.category,
        isPublic: formData.isPublic,
        superAdminId: admin._id as any,
      });

      toast.success("Setting updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedSetting(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update setting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSetting || !admin) return;

    setIsSubmitting(true);
    try {
      await deleteSetting({
        settingId: selectedSetting._id,
        superAdminId: admin._id as any,
      });

      toast.success("Setting deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSelectedSetting(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete setting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!admin) return;

    setIsSubmitting(true);
    try {
      const result = await initializeDefaultSettings({
        superAdminId: admin._id as any,
      });

      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize default settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setFormData({
      key: "",
      value: "",
      description: "",
      category: "general",
      isPublic: false,
    });
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (setting: any) => {
    setSelectedSetting(setting);
    setFormData({
      key: setting.key,
      value: formatSettingValue(setting.value),
      description: setting.description || "",
      category: setting.category,
      isPublic: setting.isPublic,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (setting: any) => {
    setSelectedSetting(setting);
    setIsDeleteDialogOpen(true);
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecretValues((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-gray-500 mt-1">
            Configure global system settings and view platform statistics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleInitializeDefaults}
            disabled={isSubmitting}
          >
            <Database className="h-4 w-4 mr-2" />
            {isSubmitting ? "Initializing..." : "Initialize Defaults"}
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Setting
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="voting">Voting</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">
                        Total Admins
                      </div>
                      <div className="text-2xl font-bold">
                        {systemStats?.totalAdmins || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Building className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">
                        Departments
                      </div>
                      <div className="text-2xl font-bold">
                        {systemStats?.totalDepartments || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">
                        Active Events
                      </div>
                      <div className="text-2xl font-bold">
                        {systemStats?.activeEvents || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Vote className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">
                        Total Votes
                      </div>
                      <div className="text-2xl font-bold">
                        {systemStats?.totalVotes || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Quick overview of platform statistics and configuration status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Platform Statistics
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Admins</span>
                      <span className="text-sm font-medium">
                        {systemStats?.activeAdmins}/{systemStats?.totalAdmins}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Events</span>
                      <span className="text-sm font-medium">
                        {systemStats?.totalEvents}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Confirmed Tickets</span>
                      <span className="text-sm font-medium">
                        {systemStats?.confirmedTickets}/
                        {systemStats?.totalTickets}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Configuration Status
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Settings</span>
                      <Badge variant="outline">
                        {systemStats?.totalSettings || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">General Settings</span>
                      <Badge variant="outline">
                        {allSettings?.general?.length || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Payment Settings</span>
                      <Badge variant="outline">
                        {allSettings?.payment?.length || 0}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Categories */}
        {Object.entries(SETTING_CATEGORIES).map(
          ([categoryKey, categoryInfo]) => (
            <TabsContent
              key={categoryKey}
              value={categoryKey}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <div
                      className={`h-8 w-8 rounded-full ${categoryInfo.color} flex items-center justify-center mr-3`}
                    >
                      <categoryInfo.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle>{categoryInfo.label} Settings</CardTitle>
                      <CardDescription>
                        Configure {categoryInfo.label.toLowerCase()} related
                        settings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {allSettings[categoryKey] &&
                  allSettings[categoryKey].length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Setting</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Public</TableHead>
                          <TableHead>Modified</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allSettings[categoryKey].map((setting: any) => {
                          const isSecret = isSecretSetting(setting.key);
                          return (
                            <TableRow key={setting._id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {setting.key}
                                  </div>
                                  {setting.description && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                      {setting.description}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <code className="bg-gray-100 px-2 py-1 rounded text-sm max-w-xs truncate">
                                    {formatSettingValue(
                                      setting.value,
                                      isSecret
                                    )}
                                  </code>
                                  {isSecret && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        toggleSecretVisibility(setting.key)
                                      }
                                    >
                                      {showSecretValues[setting.key] ? (
                                        <EyeOff className="h-3 w-3" />
                                      ) : (
                                        <Eye className="h-3 w-3" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {setting.isPublic ? (
                                  <Badge
                                    variant="outline"
                                    className="text-green-600"
                                  >
                                    Public
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-red-600"
                                  >
                                    Private
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {formatTimestamp(setting.lastModifiedAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(setting)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDeleteDialog(setting)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-10">
                      <categoryInfo.icon className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">
                        No {categoryInfo.label.toLowerCase()} settings found
                      </h3>
                      <p className="mt-1 text-gray-500">
                        Get started by adding some{" "}
                        {categoryInfo.label.toLowerCase()} configuration
                        settings.
                      </p>
                      <Button className="mt-4" onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Setting
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        )}
      </Tabs>

      {/* Create Setting Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Setting</DialogTitle>
            <DialogDescription>
              Create a new system configuration setting.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="key">Setting Key *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, key: e.target.value }))
                  }
                  placeholder="e.g., app_name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">Value *</Label>
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, value: e.target.value }))
                  }
                  placeholder="Setting value (string, number, boolean, or JSON)"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Object.entries(SETTING_CATEGORIES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description of what this setting controls"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isPublic: checked }))
                  }
                />
                <Label htmlFor="isPublic">
                  Make this setting publicly visible
                </Label>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Setting"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Setting Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <DialogDescription>
              Update the system setting configuration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-key">Setting Key</Label>
                <Input
                  id="edit-key"
                  value={formData.key}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Setting key cannot be changed
                </p>
              </div>
              <div>
                <Label htmlFor="edit-value">Value *</Label>
                <Textarea
                  id="edit-value"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, value: e.target.value }))
                  }
                  placeholder="Setting value (string, number, boolean, or JSON)"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Object.entries(SETTING_CATEGORIES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description of what this setting controls"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isPublic: checked }))
                  }
                />
                <Label htmlFor="edit-isPublic">
                  Make this setting publicly visible
                </Label>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Setting"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Setting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the setting "
              {selectedSetting?.key}"?
              <br />
              <br />
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <strong>Warning:</strong> This action cannot be undone.
                    Deleting system settings may affect platform functionality.
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Deleting..." : "Delete Setting"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
