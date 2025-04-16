"use client";

import { Container } from "@/components/ui/container";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TicketScanner } from "@/components/admin/ticket-scanner";
import { AdminRequiredAuth } from "@/components/admin/admin-required-auth";
import { DashboardBreadcrumb } from "@/components/admin/dashboard-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CheckInPage() {
  const params = useParams();
  const eventId = params.id as string;

  // Parse the event ID
  const parsedEventId = eventId ? (eventId as Id<"events">) : undefined;

  // Fetch the event details
  const event = useQuery(
    api.events.getEvent,
    parsedEventId ? { eventId: parsedEventId } : "skip"
  );

  // Fetch the check-in stats
  const checkInStats = useQuery(
    api.ticketReservations.getCheckInStats,
    parsedEventId ? { eventId: parsedEventId } : "skip"
  );

  const isLoading = !event || !checkInStats;

  return (
    <AdminRequiredAuth>
      <Container className="py-6">
        {/* Breadcrumb */}
        <DashboardBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Events", href: "/admin/events" },
            { label: event?.name || "Event", href: `/admin/events/${eventId}` },
            { label: "Check-In", href: `/admin/events/${eventId}/check-in` },
          ]}
        />

        <div className="mt-4">
          <h1 className="text-2xl font-bold">
            {event?.name || "Event"} - Check-In
          </h1>
          {event?.location && (
            <p className="text-muted-foreground mt-1">{event.location}</p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2">
              <TicketScanner eventId={parsedEventId as Id<"events">} />
            </div>

            <div className="space-y-4">
              {/* Check-in stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold">
                    {checkInStats?.checkedIn || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Checked In
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold">
                    {checkInStats?.total || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Tickets
                  </div>
                </div>
              </div>

              {/* Check-in instructions */}
              <Alert>
                <AlertTitle>Instructions</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal pl-4 space-y-2 mt-2">
                    <li>Click "Scan Ticket QR Code" to start scanning.</li>
                    <li>Point the camera at the QR code on the ticket.</li>
                    <li>The system will automatically verify the ticket.</li>
                    <li>For manual entry, use the form at the bottom.</li>
                  </ol>
                </AlertDescription>
              </Alert>

              {/* Recent check-ins would go here */}
            </div>
          </div>
        )}
      </Container>
    </AdminRequiredAuth>
  );
}
