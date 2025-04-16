"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { Loader2, Share, Download, Printer } from "lucide-react";

interface PaymentSuccessProps {
  reservationId: string;
}

export const PaymentSuccess = ({ reservationId }: PaymentSuccessProps) => {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse the reservation ID
  const parsedId = reservationId
    ? (reservationId as Id<"ticket_reservations">)
    : undefined;

  // Fetch the reservation data
  const reservation = useQuery(
    api.ticketReservations.getReservation,
    parsedId ? { reservationId: parsedId } : "skip"
  );

  // Fetch the QR code
  useEffect(() => {
    if (!reservationId) return;

    const fetchQrCode = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tickets/qrcode/${reservationId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch QR code");
        }
        const dataUrl = await response.text();
        setQrCode(dataUrl);
      } catch (error) {
        console.error("Error fetching QR code:", error);
        toast({
          title: "Error",
          description: "Failed to load ticket QR code. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, [reservationId, toast]);

  // Handle sharing the ticket
  const handleShare = async () => {
    if (navigator.share && qrCode) {
      try {
        await navigator.share({
          title: "My Event Ticket",
          text: `Ticket for ${reservation?.event?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      toast({
        title: "Share not supported",
        description: "Sharing is not supported in your browser.",
      });
    }
  };

  // Handle downloading the ticket
  const handleDownload = () => {
    if (!qrCode) return;

    const a = document.createElement("a");
    a.href = qrCode;
    a.download = `ticket-${reservationId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle printing the ticket
  const handlePrint = () => {
    window.print();
  };

  if (!reservation && loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Ticket Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            The ticket you're looking for could not be found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { event, ticketType } = reservation;

  return (
    <Card className="max-w-md mx-auto print:shadow-none print:border-none">
      <CardHeader className="text-center border-b pb-4">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎟️</span>
          </div>
        </div>
        <CardTitle>Your Ticket</CardTitle>
        <p className="text-sm text-muted-foreground">{event.name}</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Ticket Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{ticketType.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Attendee:</span>
              <span className="font-medium">
                {reservation.reservation.attendeeName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Event Date:</span>
              <span className="font-medium">
                {new Date(event.startDate).toLocaleDateString()}
              </span>
            </div>
            {event.location && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{event.location}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ticket Code:</span>
              <span className="font-medium">
                {reservation.reservation.ticketCode}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center py-4">
            {loading ? (
              <div className="h-48 w-48 flex items-center justify-center border rounded">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : qrCode ? (
              <div className="p-2 border rounded bg-white">
                <Image
                  src={qrCode}
                  alt="Ticket QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
            ) : (
              <div className="h-48 w-48 flex items-center justify-center border rounded bg-muted">
                <p className="text-sm text-muted-foreground text-center px-4">
                  QR code not available
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-2 print:hidden pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={!qrCode}
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!qrCode}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
