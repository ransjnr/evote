"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
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
  ArrowLeft,
  CreditCard,
  Loader2,
  Calendar,
  Ticket,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock payment methods for demo
const PAYMENT_METHODS = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard },
  {
    id: "mobile_money",
    name: "Mobile Money",
    icon: () => (
      <Image
        src="/images/mobile-money.png"
        alt="Mobile Money"
        width={24}
        height={24}
      />
    ),
  },
];

export default function TicketPaymentPage({
  params,
}: {
  params: { reservationId: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const reservationId = params.reservationId as Id<"ticket_reservations">;

  // Local state
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get reservation details
  const reservation = useQuery(api.ticketReservations.getReservation, {
    reservationId,
  });

  // Mutation to mark the reservation as paid
  const markAsPaid = useMutation(api.ticketReservations.markReservationAsPaid);

  // Handle payment submission
  const handleSubmitPayment = async () => {
    setIsProcessing(true);

    try {
      // In a real app, this would integrate with a payment gateway
      // For demo purposes, we're just marking it as paid directly

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mark reservation as paid
      await markAsPaid({ reservationId });

      toast({
        title: "Payment successful!",
        description: "Your ticket has been confirmed.",
        variant: "success",
      });

      // Navigate to ticket view page
      router.push(`/events/tickets/view/${reservationId}`);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (!reservation) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading payment information...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { reservation: ticketReservation, ticketType, event } = reservation;

  // If already paid, redirect to ticket view
  if (ticketReservation.isPaid) {
    router.push(`/events/tickets/view/${reservationId}`);
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Link
        href={`/events/${event._id}`}
        className="flex items-center text-sm mb-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to event
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Payment form */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Complete your payment</CardTitle>
              <CardDescription>
                Pay for your tickets to {event.name}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Payment method selection */}
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Select payment method
                </h3>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`flex items-center p-3 border rounded-md cursor-pointer hover:border-primary transition-colors ${
                          selectedPaymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-3">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                        </div>
                        <div className="ml-auto">
                          <div
                            className={`w-5 h-5 rounded-full border border-primary flex items-center justify-center ${
                              selectedPaymentMethod === method.id
                                ? "bg-primary"
                                : "bg-transparent"
                            }`}
                          >
                            {selectedPaymentMethod === method.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mock payment form - would be replaced with a real payment form */}
              {selectedPaymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full p-2 border rounded-md"
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full p-2 border rounded-md"
                        disabled={isProcessing}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full p-2 border rounded-md"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === "mobile_money" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      className="w-full p-2 border rounded-md"
                      disabled={isProcessing}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You will receive a prompt on your phone to complete the
                    payment.
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  className="w-full h-12"
                  onClick={handleSubmitPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Pay {formatCurrency(ticketReservation.totalAmount)}
                    </>
                  )}
                </Button>
                <p className="text-xs text-center mt-2 text-muted-foreground flex justify-center">
                  <Lock className="h-3 w-3 mr-1" /> Secure payment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{event.name}</h3>
                  <div className="flex text-sm text-muted-foreground items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(new Date(event.startDate))}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-sm">
                    {ticketType.name} × {ticketReservation.quantity}
                  </span>
                  <span>
                    {formatCurrency(
                      ticketType.price * ticketReservation.quantity
                    )}
                  </span>
                </div>
                {ticketReservation.fees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Service fee</span>
                    <span>{formatCurrency(ticketReservation.fees)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(ticketReservation.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <p>
                  This is a demo payment page. No actual payment will be
                  processed.
                </p>
                <p>
                  In a production environment, this would integrate with a
                  payment gateway like Stripe, PayStack, or Flutterwave.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
