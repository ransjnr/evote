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
  CheckCircle,
  Loader2,
  ArrowRight,
  QrCode,
  Download,
  Share2,
  Mail,
  Copy,
} from "lucide-react";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";
import QRCode from "qrcode";
import Image from "next/image";

export default function TicketConfirmation() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.transactionId as string;
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingInterval, setProcessingInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

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

  // Generate QR codes for all tickets
  useEffect(() => {
    if (tickets.length > 0 && event && Object.keys(qrCodes).length === 0) {
      setIsGeneratingQR(true);
      const generateQRCodes = async () => {
        const qrCodeMap: { [key: string]: string } = {};

        for (const ticket of tickets) {
          const qrData = JSON.stringify({
            ticketCode: ticket.ticketCode,
            eventId: event._id,
            eventName: event.name,
            purchaserName: ticket.purchaserName,
            timestamp: Date.now(),
          });

          try {
            const qrCodeDataURL = await QRCode.toDataURL(qrData, {
              width: 200,
              margin: 2,
              color: {
                dark: "#000000",
                light: "#FFFFFF",
              },
            });
            qrCodeMap[ticket._id] = qrCodeDataURL;
          } catch (error) {
            console.error("Error generating QR code:", error);
          }
        }

        setQrCodes(qrCodeMap);
        setIsGeneratingQR(false);
      };

      generateQRCodes();
    }
  }, [tickets, event, qrCodes]);

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

  const handleCopyTicketCode = (ticketCode: string) => {
    navigator.clipboard.writeText(ticketCode);
    toast.success("Ticket code copied to clipboard!");
  };

  const handleDownloadQR = (ticketId: string, ticketCode: string) => {
    const qrDataURL = qrCodes[ticketId];
    if (qrDataURL) {
      const link = document.createElement("a");
      link.href = qrDataURL;
      link.download = `ticket-${ticketCode}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded!");
    }
  };

  const handleShareTicket = async (ticket: any) => {
    const shareData = {
      title: `Ticket for ${event?.name}`,
      text: `I have a ticket for ${event?.name}! Ticket Code: ${ticket.ticketCode}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(shareData.url);
      toast.success("Link copied to clipboard!");
    }
  };

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
            <Image
              src="/Pollix.png"
              alt="Pollix"
              width="32"
              height="32"
              className="mr-2 rounded"
            />
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
                  <span>🎫 Ticket Purchase Confirmation</span>
                  <Badge
                    variant={
                      payment.status === "succeeded" ? "default" : "secondary"
                    }
                    className={
                      payment.status === "succeeded"
                        ? "bg-green-100 text-green-800"
                        : ""
                    }
                  >
                    {payment.status === "succeeded"
                      ? "✅ Confirmed"
                      : "⏳ Processing"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Transaction ID: {transactionId}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Processing Payment
                    </h3>
                    <p className="text-gray-500 text-center">
                      Please wait while we process your payment. This may take a
                      few moments.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Success Message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-800">
                          Payment Successful!
                        </h3>
                        <p className="text-green-700 text-sm">
                          Your tickets have been confirmed and a confirmation
                          email has been sent to {tickets[0]?.purchaserEmail}
                        </p>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Event Details
                      </h3>
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

                    {/* Ticket Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Ticket Details
                      </h3>
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

                        {ticketType.benefits &&
                          ticketType.benefits.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium mb-2">
                                Included Benefits:
                              </p>
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

                    {/* Your Tickets with QR Codes */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Your Tickets
                      </h3>
                      <div className="space-y-4">
                        {tickets.map((ticket) => (
                          <Card
                            key={ticket._id}
                            className="border-2 border-primary/20"
                          >
                            <CardContent className="pt-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                {/* Ticket Info */}
                                <div className="md:col-span-2">
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <p className="font-medium text-lg">
                                        {ticket.purchaserName}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {ticket.purchaserEmail}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {ticket.purchaserPhone}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={
                                        ticket.status === "confirmed"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className={
                                        ticket.status === "confirmed"
                                          ? "bg-green-100 text-green-800"
                                          : ""
                                      }
                                    >
                                      {ticket.status === "confirmed"
                                        ? "✅ Confirmed"
                                        : ticket.status}
                                    </Badge>
                                  </div>

                                  {/* Ticket Code */}
                                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                                    <p className="text-sm text-gray-600 mb-1">
                                      Ticket Code
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <code className="text-lg font-mono font-bold text-primary">
                                        {ticket.ticketCode}
                                      </code>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleCopyTicketCode(
                                            ticket.ticketCode
                                          )
                                        }
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap gap-2 mt-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDownloadQR(
                                          ticket._id,
                                          ticket.ticketCode
                                        )
                                      }
                                      disabled={!qrCodes[ticket._id]}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download QR
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleShareTicket(ticket)}
                                    >
                                      <Share2 className="w-4 h-4 mr-2" />
                                      Share
                                    </Button>
                                  </div>
                                </div>

                                {/* QR Code */}
                                <div className="text-center">
                                  {isGeneratingQR ? (
                                    <div className="flex flex-col items-center">
                                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                                      <p className="text-sm text-gray-500">
                                        Generating QR...
                                      </p>
                                    </div>
                                  ) : qrCodes[ticket._id] ? (
                                    <div>
                                      <img
                                        src={qrCodes[ticket._id]}
                                        alt="Ticket QR Code"
                                        className="w-32 h-32 mx-auto border rounded-lg"
                                      />
                                      <p className="text-xs text-gray-500 mt-2">
                                        <QrCode className="w-3 h-3 inline mr-1" />
                                        Scan to verify
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                                      <QrCode className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Total Amount */}
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-lg">
                          Total Amount Paid
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          ₵{payment.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/events/${event._id}`)}
                  className="w-full sm:w-auto"
                >
                  Back to Event
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  {payment.status === "succeeded" && (
                    <>
                      <Button
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-none"
                      >
                        Print Tickets
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const mailtoLink = `mailto:${tickets[0]?.purchaserEmail}?subject=Your tickets for ${event.name}&body=Your tickets have been confirmed! Transaction ID: ${transactionId}`;
                          window.location.href = mailtoLink;
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
