"use client";

import { useState } from "react";
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
import {
  Calendar,
  Edit,
  Trash2,
  Plus,
  Award,
  Users,
  Ticket,
  CheckCircle,
  XCircle,
  MapPin,
} from "lucide-react";

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

  // Get ticket types for this event
  const ticketTypes =
    useQuery(
      api.tickets.getTicketTypes,
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
            {event.isActive ? (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Link href="/admin/events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>{event.venue}</span>
              </div>
            )}
            {event.maxAttendees && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span>Maximum {event.maxAttendees} attendees</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge
                variant={event.isActive ? "success" : "secondary"}
                className="h-6"
              >
                {event.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className="h-6">
                {event.eventType === "voting_only"
                  ? "Voting Only"
                  : event.eventType === "ticketing_only"
                    ? "Ticketing Only"
                    : "Voting & Ticketing"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {(event.eventType === "voting_only" ||
            event.eventType === "voting_and_ticketing") && (
            <TabsTrigger value="categories">Categories</TabsTrigger>
          )}
          {(event.eventType === "ticketing_only" ||
            event.eventType === "voting_and_ticketing") && (
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Statistics</CardTitle>
              <CardDescription>
                Overview of your event&apos;s performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(event.eventType === "voting_only" ||
                  event.eventType === "voting_and_ticketing") && (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Categories
                        </CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {categories.length}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Vote Price
                        </CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ₵{event.votePrice?.toFixed(2) || "N/A"}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {(event.eventType === "ticketing_only" ||
                  event.eventType === "voting_and_ticketing") && (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Ticket Types
                        </CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {ticketTypes.length}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Capacity
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {event.maxAttendees || "Unlimited"}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {(event.eventType === "voting_only" ||
          event.eventType === "voting_and_ticketing") && (
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Manage voting categories for this event
                  </CardDescription>
                </div>
                <Link href={`/admin/events/${eventId}/categories/new`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Categories Yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start by adding categories to your event
                    </p>
                    <Link href={`/admin/events/${eventId}/categories/new`}>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Category
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/admin/events/${eventId}/categories/${category._id}`}
                      >
                        <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              {category.name}
                              <Badge variant="outline">{category.type}</Badge>
                            </CardTitle>
                            {category.description && (
                              <CardDescription>
                                {category.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {(event.eventType === "ticketing_only" ||
          event.eventType === "voting_and_ticketing") && (
          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ticket Management</CardTitle>
                  <CardDescription>
                    Manage ticket types and validate tickets
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/events/${eventId}/validate-tickets`}>
                    <Button variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Validate Tickets
                    </Button>
                  </Link>
                  <Link href={`/admin/events/${eventId}/tickets`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Ticket Type
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {ticketTypes.length === 0 ? (
                  <div className="text-center py-8">
                    <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Ticket Types Yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start by adding ticket types to your event
                    </p>
                    <Link href={`/admin/events/${eventId}/tickets`}>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Ticket Type
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ticketTypes.map((ticketType) => (
                      <Card key={ticketType._id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {ticketType.name}
                            <Badge
                              variant={
                                ticketType.remaining > 0
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {ticketType.remaining} / {ticketType.quantity}
                            </Badge>
                          </CardTitle>
                          {ticketType.description && (
                            <CardDescription>
                              {ticketType.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-gray-500">Price:</span>
                              <span className="text-lg font-semibold">
                                ₵{ticketType.price.toFixed(2)}
                              </span>
                            </div>
                            {ticketType.benefits &&
                              ticketType.benefits.length > 0 && (
                                <div>
                                  <span className="text-gray-500">
                                    Benefits:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {ticketType.benefits.map(
                                      (benefit: string, index: number) => (
                                        <Badge key={index} variant="secondary">
                                          {benefit}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {(ticketType.saleStartDate ||
                              ticketType.saleEndDate) && (
                              <div className="text-sm text-gray-500">
                                <p>
                                  {ticketType.saleStartDate
                                    ? `Sales start: ${formatDate(ticketType.saleStartDate)}`
                                    : ""}
                                </p>
                                <p>
                                  {ticketType.saleEndDate
                                    ? `Sales end: ${formatDate(ticketType.saleEndDate)}`
                                    : ""}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Link href={`/admin/events/${eventId}/tickets`}>
                            <Button variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
