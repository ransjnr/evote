"use client";

import React, { useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Loader2,
  Ticket,
  Calendar,
  MapPin,
  Download,
  QrCode,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TicketDetailsProps {
  reservationId: Id<"ticket_reservations">;
  ticketCode: string;
}

export const TicketDetails: React.FC<TicketDetailsProps> = ({
  reservationId,
  ticketCode,
}) => {
  // Fetch reservation details
  const reservation = useQuery(api.ticketReservations.getReservation, {
    reservationId,
  });

  // QR code generation action
  const generateQRCode = useAction(api.qrcode.generateTicketQRCode);

  useEffect(() => {
    // Generate QR code if reservation exists and doesn't have one already
    if (reservation && !reservation.reservation.qrCodeUrl) {
      generateQRCode({
        ticketCode,
        reservationId,
      }).catch((err) => {
        console.error("Failed to generate QR code:", err);
      });
    }
  }, [reservation, ticketCode, reservationId, generateQRCode]);

  // Loading state
  if (!reservation) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading ticket information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { reservation: ticketReservation, ticketType, event } = reservation;

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="bg-primary/10 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Ticket className="mr-2 h-5 w-5 text-primary" />
              e-Ticket
            </CardTitle>
            <CardDescription>Your ticket for {event.name}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Status</p>
            <span
              className={`text-sm rounded-full px-2 py-0.5 ${
                ticketReservation.isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {ticketReservation.isPaid ? "Paid" : "Pending Payment"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* QR Code section */}
        <div className="flex flex-col items-center mb-4">
          {ticketReservation.qrCodeUrl ? (
            <div className="border-4 border-primary p-2 rounded-lg mb-2">
              <Image
                src={ticketReservation.qrCodeUrl}
                alt="Ticket QR Code"
                width={200}
                height={200}
                className="rounded"
              />
            </div>
          ) : (
            <div
              className="border-4 border-primary p-2 rounded-lg flex items-center justify-center mb-2"
              style={{ width: 200, height: 200 }}
            >
              <QrCode className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <p className="text-center font-mono text-sm mt-2">{ticketCode}</p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Present this code at the venue for entry
          </p>
        </div>

        {/* Event & Ticket Info */}
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg">{event.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(new Date(event.startDate))}</span>
            </div>
            {event.location && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <div className="border-b pb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Ticket Details
            </h4>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Type</span>
              <span className="font-medium">{ticketType.name}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Quantity</span>
              <span className="font-medium">{ticketReservation.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Price</span>
              <span className="font-medium">
                {formatCurrency(ticketReservation.totalAmount)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Attendee Information
            </h4>
            <p className="font-medium">{ticketReservation.buyerName}</p>
            <p className="text-sm">{ticketReservation.buyerEmail}</p>
            <p className="text-sm">{ticketReservation.buyerPhone}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Save
        </Button>

        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>

        {!ticketReservation.isPaid && (
          <Link href={`/events/tickets/payment/${reservationId}`}>
            <Button size="sm" variant="default">
              Complete Payment
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};
