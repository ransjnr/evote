"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Ticket, CheckCircle2, XCircle, Search } from "lucide-react";

export default function ValidateTickets() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [lastValidatedTicket, setLastValidatedTicket] = useState<any>(null);

  // Get event details
  const event = useQuery(api.events.getEvent, { eventId });

  // Validate ticket mutation
  const validateTicket = useMutation(api.tickets.validateTicket);

  // Get ticket type if we have a last validated ticket
  const ticketType = useQuery(
    api.tickets.getTicketType,
    lastValidatedTicket?.ticketTypeId
      ? { ticketTypeId: lastValidatedTicket.ticketTypeId }
      : "skip"
  );

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketCode.trim()) {
      toast.error("Please enter a ticket code");
      return;
    }

    setIsLoading(true);

    try {
      const result = await validateTicket({
        ticketCode: ticketCode.trim(),
      });

      if (result.success) {
        setLastValidatedTicket(result.ticket);
        toast.success("Ticket validated successfully!");
        setTicketCode("");
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to validate ticket");
      setLastValidatedTicket(null);
    } finally {
      setIsLoading(false);
    }
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

  if (event.eventType === "voting_only") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tickets Not Available</h2>
          <p className="text-gray-500 mb-4">
            This is a voting-only event and does not have tickets to validate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Validate Tickets</h1>
        <p className="text-gray-500 mt-1">
          Scan or enter ticket codes to validate attendees for {event.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Validation</CardTitle>
            <CardDescription>
              Enter the ticket code to validate attendance
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleValidate}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticketCode">Ticket Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="ticketCode"
                      placeholder="Enter ticket code"
                      value={ticketCode}
                      onChange={(e) => setTicketCode(e.target.value)}
                      className="flex-1"
                      autoComplete="off"
                      autoFocus
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        "Validating..."
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Validate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Validated Ticket</CardTitle>
            <CardDescription>
              Details of the most recently validated ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastValidatedTicket ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      lastValidatedTicket.status === "used"
                        ? "success"
                        : "warning"
                    }
                    className="h-8 px-3 text-sm"
                  >
                    {lastValidatedTicket.status === "used" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Valid
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Invalid
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="h-8 px-3 text-sm">
                    {lastValidatedTicket.ticketCode}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div>
                    <p className="font-medium">Ticket Type</p>
                    <p className="text-gray-500">{ticketType?.name}</p>
                  </div>

                  <div>
                    <p className="font-medium">Attendee Details</p>
                    <p className="text-gray-500">
                      {lastValidatedTicket.purchaserName}
                    </p>
                    <p className="text-gray-500">
                      {lastValidatedTicket.purchaserEmail}
                    </p>
                    <p className="text-gray-500">
                      {lastValidatedTicket.purchaserPhone}
                    </p>
                  </div>

                  {lastValidatedTicket.additionalDetails && (
                    <div>
                      <p className="font-medium">Additional Information</p>
                      {lastValidatedTicket.additionalDetails.age && (
                        <p className="text-gray-500">
                          Age: {lastValidatedTicket.additionalDetails.age}
                        </p>
                      )}
                      {lastValidatedTicket.additionalDetails.gender && (
                        <p className="text-gray-500">
                          Gender: {lastValidatedTicket.additionalDetails.gender}
                        </p>
                      )}
                      {lastValidatedTicket.additionalDetails
                        .specialRequirements && (
                        <p className="text-gray-500">
                          Special Requirements:{" "}
                          {
                            lastValidatedTicket.additionalDetails
                              .specialRequirements
                          }
                        </p>
                      )}
                    </div>
                  )}

                  {lastValidatedTicket.usedAt && (
                    <div>
                      <p className="font-medium">Validated At</p>
                      <p className="text-gray-500">
                        {new Date(lastValidatedTicket.usedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Ticket className="w-12 h-12 mb-4" />
                <p>No ticket has been validated yet</p>
                <p className="text-sm">
                  Validated ticket details will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
