"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  Loader2,
  ArrowRight,
  Menu,
} from "lucide-react";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";

export default function TicketConfirmation() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.transactionId as string;
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingInterval, setProcessingInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Get payment details
  const payment = useQuery(api.payments.getPaymentByTransaction, {
    transactionId,
  });

  // Get event details if payment exists
  const event = useQuery(
    api.events.getEvent,
    payment ? { eventId: payment.eventId } : "skip"
  );

  // Get ticket type if payment exists and is for tickets
  const ticketType = useQuery(
    api.tickets.getTicketType,
    payment?.ticketTypeId ? { ticketTypeId: payment.ticketTypeId } : "skip"
  );

  // Get tickets
  const tickets =
    useQuery(api.tickets.getTicketsByTransaction, { transactionId }) || [];

  // Confirm payment mutation
  const confirmPayment = useMutation(api.tickets.confirmTicketPayment);

  useEffect(() => {
    // Simulate payment processing
    // In a real application, this would be handled by your payment provider's webhook
    const interval = setInterval(async () => {
      if (payment && payment.status === "pending") {
        try {
          await confirmPayment({ transactionId });
          setIsProcessing(false);
          if (processingInterval) {
            clearInterval(processingInterval);
          }
        } catch (error) {
          // Continue processing
        }
      } else if (payment && payment.status === "succeeded") {
        setIsProcessing(false);
        if (processingInterval) {
          clearInterval(processingInterval);
        }
      }
    }, 3000);

    setProcessingInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [payment, confirmPayment, transactionId]);

  if (!payment || !event || !ticketType) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-500 mb-4">
            Please wait while we load your ticket details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="py-4 px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-primary flex items-center"
          >
            <span className="bg-primary text-white p-1 rounded mr-1">e</span>
            Vote
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/events"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Events
            </Link>
            <Link
              href="/features"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Blog
            </Link>
            <Link
              href="/etickets"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              eTicketing
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/events"
              className="hidden md:block text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Explore Events
            </Link>
            <Link href="/admin/login">
              <Button>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ticket Purchase Confirmation</span>
              <Badge
                variant={payment.status === "succeeded" ? "success" : "warning"}
              >
                {payment.status === "succeeded" ? "Confirmed" : "Processing"}
              </Badge>
            </CardTitle>
            <CardDescription>Transaction ID: {transactionId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Processing Payment
                </h3>
                <p className="text-gray-500 text-center">
                  Please wait while we process your payment. This may take a few
                  moments.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                  <div className="space-y-2">
                    <p className="text-xl font-bold">{event.name}</p>
                    {event.description && (
                      <p className="text-gray-600">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString()} -{" "}
                          {new Date(event.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Ticket Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <p className="font-medium">{ticketType.name}</p>
                        {ticketType.description && (
                          <p className="text-sm text-gray-500">
                            {ticketType.description}
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-semibold">
                        ₵{ticketType.price.toFixed(2)} × {tickets.length}
                      </p>
                    </div>

                    {ticketType.benefits && ticketType.benefits.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium mb-2">Included Benefits:</p>
                        <ul className="space-y-1">
                          {ticketType.benefits.map(
                            (benefit: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>{benefit}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Tickets</h3>
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <Card key={ticket._id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {ticket.purchaserName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {ticket.purchaserEmail}
                              </p>
                              <p className="text-sm text-gray-500">
                                {ticket.purchaserPhone}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-2">
                                Ticket Code: {ticket.ticketCode}
                              </Badge>
                              <Badge
                                variant={
                                  ticket.status === "confirmed"
                                    ? "success"
                                    : "warning"
                                }
                              >
                                {ticket.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-2xl font-bold">
                      ₵{payment.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/events/${event._id}`)}
            >
              Back to Event
            </Button>
            {payment.status === "succeeded" && (
              <Button onClick={() => window.print()}>Print Tickets</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  </main>

  {/* Footer */}
  <Footer />
</div>
