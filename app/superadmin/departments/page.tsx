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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Building,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Vote,
  Ticket,
  Eye,
  AlertTriangle,
  Search,
  Activity,
  UserCheck,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatDistanceToNow } from "date-fns";

export default function SuperAdminDepartmentsPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });

  // Get departments with statistics
  const departmentsWithStats =
    useQuery(api.departments.getDepartmentsWithStats) || [];

  // Mutations
  const createDepartment = useMutation(api.departments.createDepartment);
  const updateDepartment = useMutation(api.departments.updateDepartment);
  const deleteDepartment = useMutation(api.departments.deleteDepartment);

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

  // Filter departments based on search
  const filteredDepartments = departmentsWithStats.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dept.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Handle form submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createDepartment({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        slug: formData.slug.trim(),
        adminId: admin._id as any,
      });

      toast.success("Department created successfully!");
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "", slug: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to create department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDepartment({
        departmentId: selectedDepartment._id,
        name:
          formData.name.trim() !== selectedDepartment.name
            ? formData.name.trim()
            : undefined,
        description:
          formData.description.trim() !== selectedDepartment.description
            ? formData.description.trim()
            : undefined,
        slug:
          formData.slug.trim() !== selectedDepartment.slug
            ? formData.slug.trim()
            : undefined,
      });

      toast.success("Department updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDepartment || !admin) return;

    setIsSubmitting(true);
    try {
      await deleteDepartment({
        departmentId: selectedDepartment._id,
        superAdminId: admin._id as any,
      });

      toast.success("Department deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setFormData({ name: "", description: "", slug: "" });
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (department: any) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
      slug: department.slug,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (department: any) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (department: any) => {
    setSelectedDepartment(department);
    setIsViewDialogOpen(true);
  };

  const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Departments
          </h1>
          <p className="text-gray-500 mt-1">
            Create, edit, and manage all departments in the system
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Department
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">
                    Total Departments
                  </div>
                  <div className="text-2xl font-bold">
                    {departmentsWithStats.length}
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
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">
                    Active Events
                  </div>
                  <div className="text-2xl font-bold">
                    {departmentsWithStats.reduce(
                      (acc, dept) => acc + dept.activeEvents,
                      0
                    )}
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
                  <UserCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">
                    Total Admins
                  </div>
                  <div className="text-2xl font-bold">
                    {departmentsWithStats.reduce(
                      (acc, dept) => acc + dept.totalAdmins,
                      0
                    )}
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
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">
                    Total Events
                  </div>
                  <div className="text-2xl font-bold">
                    {departmentsWithStats.reduce(
                      (acc, dept) => acc + dept.totalEvents,
                      0
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            Manage departments and view their statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDepartments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Admins</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{department.name}</div>
                        {department.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {department.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{department.slug}</Badge>
                    </TableCell>
                    <TableCell>
                      {department.createdBy ? (
                        <div className="flex items-center">
                          <span
                            className={
                              department.createdBy.isDeleted
                                ? "line-through text-gray-400"
                                : ""
                            }
                          >
                            {department.createdBy.name}
                          </span>
                          {department.createdBy.isDeleted && (
                            <Badge variant="destructive" className="ml-2">
                              Deleted
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{department.activeEvents}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">
                          {department.totalEvents}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{department.activeAdmins}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">
                          {department.totalAdmins}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatTimestamp(department.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(department)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(department)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(department)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <Building className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No departments found
              </h3>
              <p className="mt-1 text-gray-500">
                {searchQuery
                  ? "No departments match your search."
                  : "Get started by creating a new department."}
              </p>
              {!searchQuery && (
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Department
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Department Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
            <DialogDescription>
              Add a new department to the system. This will allow admins to be
              assigned to this department.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: value,
                      slug: generateSlug(value),
                    }));
                  }}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="e.g., computer-science"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL-friendly identifier. Will be auto-generated from name.
                </p>
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
                  placeholder="Optional description of the department"
                  rows={3}
                />
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
                {isSubmitting ? "Creating..." : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update the department information. Be careful when changing the
              slug as it affects admin assignments.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Department Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="e.g., computer-science"
                  required
                />
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ Changing the slug will affect admin department assignments.
                </p>
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
                  placeholder="Optional description of the department"
                  rows={3}
                />
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
                {isSubmitting ? "Updating..." : "Update Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Department Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedDepartment?.name}</DialogTitle>
            <DialogDescription>
              Department details and statistics
            </DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Name
                  </Label>
                  <p className="text-sm">{selectedDepartment.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Slug
                  </Label>
                  <Badge variant="outline">{selectedDepartment.slug}</Badge>
                </div>
              </div>

              {selectedDepartment.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Description
                  </Label>
                  <p className="text-sm">{selectedDepartment.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Created By
                  </Label>
                  <p className="text-sm">
                    {selectedDepartment.createdBy?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Created
                  </Label>
                  <p className="text-sm">
                    {formatTimestamp(selectedDepartment.createdAt)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-500 mb-3 block">
                  Statistics
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">
                      {selectedDepartment.activeEvents}/
                      {selectedDepartment.totalEvents} Active Events
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">
                      {selectedDepartment.activeAdmins}/
                      {selectedDepartment.totalAdmins} Active Admins
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                openEditDialog(selectedDepartment);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the department "
              {selectedDepartment?.name}"?
              <br />
              <br />
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This action cannot be undone. The
                    department can only be deleted if:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>It has no existing events</li>
                      <li>It has no assigned admins</li>
                    </ul>
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
              {isSubmitting ? "Deleting..." : "Delete Department"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
