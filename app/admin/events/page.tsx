"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";

// Define error type
interface ConvexError {
  message: string;
}

export default function AdminEvents() {
  const { admin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [departmentCreated, setDepartmentCreated] = useState(false);

  // List all departments to check what exists
  const allDepartments = useQuery(api.departments.listDepartments) || [];

  // Get department info
  const department = useQuery(
    api.departments.getDepartmentBySlug,
    admin?.departmentId ? { slug: admin.departmentId } : "skip"
  );

  // Create department mutation
  const createDepartment = useMutation(api.departments.createDepartment);

  // Auto-handle missing department
  useEffect(() => {
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
                "Department created successfully. Events will now load correctly."
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
  ]);

  // Loading state while creating department
  if (isCreatingDepartment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Setting Up Events</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Creating Department</CardTitle>
            <CardDescription>
              Setting up your department to show events...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p>Setting up your environment...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get events for this department
  const events =
    useQuery(
      api.events.listEventsByDepartment,
      department ? { departmentId: department._id } : "skip"
    ) || [];

  // Filter events based on search query
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine event status
  const getEventStatus = (event: any) => {
    const now = Date.now();
    if (now > event.endDate) {
      return "ended";
    } else if (now >= event.startDate && now <= event.endDate) {
      return "running";
    } else {
      return "upcoming";
    }
  };

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "running":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Toggle event status
  const toggleEventStatus = useMutation(api.events.toggleEventStatus);
  const deleteEvent = useMutation(api.events.deleteEvent);

  const handleToggleStatus = async (
    eventId: string,
    currentStatus: boolean
  ) => {
    try {
      await toggleEventStatus({
        eventId,
        isActive: !currentStatus,
      });

      toast.success(
        `Event ${currentStatus ? "deactivated" : "activated"} successfully!`
      );
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to update event status");
    }
  };

  const handleDeleteClick = (eventId: string) => {
    setDeleteEventId(eventId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteEventId) return;

    setIsDeleting(true);
    try {
      await deleteEvent({
        eventId: deleteEventId,
      });

      toast.success("Event deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeleteEventId(null);
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link href="/admin/events/new">
          <Button>Create New Event</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            Manage your department&apos;s voting events
          </CardDescription>
          <div className="mt-2">
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-10">
              {searchQuery ? (
                <p className="text-gray-500">No events match your search</p>
              ) : (
                <>
                  <p className="text-gray-500 mb-4">No events created yet</p>
                  <Link href="/admin/events/new">
                    <Button>Create Your First Event</Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Vote Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <TableRow key={event._id}>
                      <TableCell className="font-medium">
                        {event.name}
                      </TableCell>
                      <TableCell>
                        {new Date(event.startDate).toLocaleDateString()} -{" "}
                        {new Date(event.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>₵{event.votePrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div
                            className={`px-2 py-1 rounded text-xs inline-block ${
                              event.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {event.isActive ? "Active" : "Inactive"}
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs inline-block ${getStatusBadgeStyle(status)}`}
                          >
                            {status === "upcoming"
                              ? "Upcoming"
                              : status === "running"
                                ? "Running"
                                : "Ended"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(event._id, event.isActive)
                            }
                          >
                            {event.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Link href={`/admin/events/${event._id}`}>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(event._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This will also delete
              all associated categories and nominees. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
