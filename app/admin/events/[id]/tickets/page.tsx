"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AdminRequiredAuth } from "@/components/admin/admin-required-auth";
import { DashboardBreadcrumb } from "@/components/admin/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Loader2,
  MoreVertical,
  Plus,
  Ticket,
  QrCode,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { CreateTicketTypeModal } from "@/components/admin/tickets/create-ticket-type-modal";
import { useToast } from "@/components/ui/use-toast";

export default function EventTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;
  const parsedEventId = eventId as Id<"events">;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("types");

  // Fetch event data
  const event = useQuery(api.events.getEvent, { eventId: parsedEventId });

  // Fetch ticket types for this event
  const ticketTypes = useQuery(api.events.getTicketTypes, {
    eventId: parsedEventId,
  });

  // Fetch reservations for this event
  const reservations = useQuery(api.ticketReservations.getReservationsByEvent, {
    eventId: parsedEventId,
  });

  // Mutations
  const toggleTicketTypeStatus = useMutation(api.events.toggleTicketTypeActive);

  const handleToggleStatus = async (ticketTypeId: Id<"ticket_types">) => {
    try {
      await toggleTicketTypeStatus({ ticketTypeId });
      toast({
        title: "Status updated",
        description: "Ticket type status has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket type status.",
        variant: "destructive",
      });
    }
  };

  // Handle ticket type creation
  const handleTicketTypeCreated = () => {
    setIsCreateModalOpen(false);
    toast({
      title: "Success",
      description: "Ticket type has been created successfully.",
    });
  };

  if (!event) {
    return (
      <AdminRequiredAuth>
        <Container className="py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Container>
      </AdminRequiredAuth>
    );
  }

  return (
    <AdminRequiredAuth>
      <Container className="py-8">
        {/* Breadcrumb */}
        <DashboardBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Events", href: "/admin/events" },
            { label: event.name, href: `/admin/events/${eventId}` },
            { label: "Tickets", href: `/admin/events/${eventId}/tickets` },
          ]}
        />

        {/* Header section */}
        <div className="flex justify-between items-center mt-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold">{event.name} - Tickets</h1>
            <p className="text-muted-foreground">
              Manage tickets and reservations for this event
            </p>
          </div>
          <div className="flex gap-3">
            <Link href={`/admin/events/${eventId}/check-in`}>
              <Button variant="outline" className="gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Check-in
              </Button>
            </Link>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Ticket Type
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ticket Types
              </CardTitle>
              <div className="text-2xl font-bold">
                {ticketTypes?.length || 0}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {ticketTypes?.filter((t) => t.isActive).length || 0} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reservations
              </CardTitle>
              <div className="text-2xl font-bold">
                {reservations?.length || 0}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {reservations?.filter((r) => r.isPaid).length || 0} paid
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue
              </CardTitle>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  reservations
                    ?.filter((r) => r.isPaid)
                    .reduce((sum, r) => sum + r.totalAmount, 0) || 0
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                From {reservations?.filter((r) => r.isPaid).length || 0} tickets
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="types"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="types" className="gap-2">
              <Ticket className="h-4 w-4" />
              Ticket Types
            </TabsTrigger>
            <TabsTrigger value="reservations" className="gap-2">
              <QrCode className="h-4 w-4" />
              Reservations
            </TabsTrigger>
          </TabsList>

          {/* Ticket Types Tab */}
          <TabsContent value="types">
            {!ticketTypes || ticketTypes.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>No Ticket Types Found</CardTitle>
                  <CardDescription>
                    Create your first ticket type to start selling tickets for
                    this event.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    Create Ticket Type
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Types</CardTitle>
                  <CardDescription>
                    Manage the different ticket types available for this event.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ticketTypes.map((type) => (
                        <TableRow key={type._id}>
                          <TableCell className="font-medium">
                            {type.name}
                          </TableCell>
                          <TableCell>{formatCurrency(type.price)}</TableCell>
                          <TableCell>{type.capacity}</TableCell>
                          <TableCell>{type.remainingCapacity}</TableCell>
                          <TableCell>
                            <Badge
                              variant={type.isActive ? "default" : "secondary"}
                            >
                              {type.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(type._id)}
                                >
                                  {type.isActive ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  disabled={
                                    type.capacity !== type.remainingCapacity
                                  }
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations">
            {!reservations || reservations.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>No Reservations Found</CardTitle>
                  <CardDescription>
                    No tickets have been reserved for this event yet.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Reservations</CardTitle>
                  <CardDescription>
                    View and manage ticket reservations for this event.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket Code</TableHead>
                        <TableHead>Attendee</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map((reservation) => (
                        <TableRow key={reservation._id}>
                          <TableCell className="font-medium">
                            {reservation.ticketCode || "-"}
                          </TableCell>
                          <TableCell>{reservation.buyerName}</TableCell>
                          <TableCell className="truncate max-w-[150px]">
                            {reservation.buyerEmail}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(reservation.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                reservation.isPaid ? "success" : "secondary"
                              }
                              className={
                                reservation.isPaid
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              }
                            >
                              {reservation.isPaid ? "Paid" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {reservation.isCheckedIn ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-800 border-blue-200"
                              >
                                Checked In
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-gray-100 text-gray-800 border-gray-200"
                              >
                                Not Checked In
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(
                                      `/tickets/payment-success/${reservation._id}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  View Ticket
                                </DropdownMenuItem>
                                {!reservation.isPaid && (
                                  <DropdownMenuItem>
                                    Mark as Paid
                                  </DropdownMenuItem>
                                )}
                                {!reservation.isCheckedIn &&
                                  reservation.isPaid && (
                                    <DropdownMenuItem>
                                      Mark as Checked In
                                    </DropdownMenuItem>
                                  )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Cancel Reservation
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </Container>

      {/* Create Ticket Type Modal */}
      <CreateTicketTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        eventId={parsedEventId}
        onCreated={handleTicketTypeCreated}
      />
    </AdminRequiredAuth>
  );
}
