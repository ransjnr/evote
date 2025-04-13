"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Define error type
interface ConvexError {
  message: string;
}

export default function EventDetail() {
  const router = useRouter();
  const params = useParams();
  const { admin } = useAuthStore();
  const eventId = params.eventId as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get event details
  const event = useQuery(api.events.getEvent, { eventId });

  // Get department info
  const department = useQuery(
    api.departments.getDepartmentBySlug,
    admin?.departmentId ? { slug: admin.departmentId } : "skip"
  );

  // Get categories for this event
  const categories =
    useQuery(
      api.categories.listCategoriesByEvent,
      event ? { eventId: event._id } : "skip"
    ) || [];

  // Toggle event status and delete event mutations
  const toggleEventStatus = useMutation(api.events.toggleEventStatus);
  const deleteEvent = useMutation(api.events.deleteEvent);

  const handleToggleStatus = async () => {
    if (!event) return;

    try {
      await toggleEventStatus({
        eventId: event._id,
        isActive: !event.isActive,
      });

      toast.success(
        `Event ${event.isActive ? "deactivated" : "activated"} successfully!`
      );
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to update event status");
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!event) return;

    setIsDeleting(true);
    try {
      await deleteEvent({
        eventId: event._id,
      });

      toast.success("Event deleted successfully!");
      setIsDeleteDialogOpen(false);
      router.push("/admin/events");
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading event...</h2>
          <p className="text-gray-500 mb-4">
            Please wait while we load the event details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <Badge variant={event.isActive ? "success" : "secondary"}>
              {event.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">
            {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="destructive" onClick={handleDeleteClick}>
            Delete Event
          </Button>
          <Button
            variant={event.isActive ? "destructive" : "default"}
            onClick={handleToggleStatus}
          >
            {event.isActive ? "Deactivate Event" : "Activate Event"}
          </Button>
          <Link href="/admin/events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="nominees">Nominees</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                View and manage details for this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-gray-600">
                  {event.description || "No description provided"}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-1">Vote Price</h3>
                  <p className="text-xl font-semibold">
                    ₵{event.votePrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Department</h3>
                  <p>{department?.name || "Loading..."}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Created</h3>
                  <p>{formatDate(event.createdAt)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/admin/events/${eventId}/edit`}>
                <Button variant="outline">Edit Event</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Status</CardTitle>
              <CardDescription>
                Manage the activation status of this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Current Status</h3>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      event.isActive ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <p>
                    This event is currently{" "}
                    <span
                      className={
                        event.isActive
                          ? "text-green-600 font-medium"
                          : "text-gray-600 font-medium"
                      }
                    >
                      {event.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                {event.isActive && (
                  <p className="text-sm text-gray-500 mt-2">
                    Voters can currently participate in this event
                  </p>
                )}
                {!event.isActive && (
                  <p className="text-sm text-gray-500 mt-2">
                    This event is not visible to voters. Activate it when ready.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant={event.isActive ? "destructive" : "default"}
                onClick={handleToggleStatus}
              >
                {event.isActive ? "Deactivate Event" : "Activate Event"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage voting categories for this event
                </CardDescription>
              </div>
              <Link href={`/admin/events/${eventId}/categories/new`}>
                <Button>Add Category</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No categories added yet</p>
                  <Link href={`/admin/events/${eventId}/categories/new`}>
                    <Button>Add Your First Category</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-gray-500">
                            {category.description || "No description"}
                          </p>
                        </div>
                        <Link href={`/admin/categories/${category._id}`}>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nominees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nominees</CardTitle>
              <CardDescription>
                View and manage all nominees across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">
                  Select a category to manage nominees
                </p>
                {categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/admin/categories/${category._id}`}
                      >
                        <Button variant="outline">{category.name}</Button>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link href={`/admin/events/${eventId}/categories/new`}>
                    <Button>Add Your First Category</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voting Results</CardTitle>
              <CardDescription>
                View real-time voting statistics and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">
                  {event.isActive
                    ? "Voting is currently in progress"
                    : "Event is not active yet"}
                </p>
                <Link href={`/admin/events/${eventId}/results`}>
                  <Button>View Detailed Results</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{event.name}"? This will also
              delete all associated categories and nominees. This action cannot
              be undone.
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
