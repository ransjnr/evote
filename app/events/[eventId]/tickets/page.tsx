"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  CreditCard,
  Star,
  Info,
  ShoppingCart,
  ArrowRight,
  Menu,
} from "lucide-react";
import {
  formatTicketPrice,
  calculateTotalPrice,
} from "@/lib/utils/ticket-utils";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";
import { PaystackButton } from "@/components/paystack/PaystackButton";
import { Header } from "@/components/ui/header";

export default function PurchaseTickets() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");

  // Form state
  const [quantity, setQuantity] = useState("1");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [purchaserPhone, setPurchaserPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Get event details
  const event = useQuery(api.events.getEvent, { eventId });

  // Get ticket types
  const ticketTypes = useQuery(api.tickets.getTicketTypes, { eventId }) || [];

  // Get real-time available counts for each ticket type
  const availableCounts = useQuery(
    api.tickets.getAvailableTicketCount,
    selectedTicketType ? { ticketTypeId: selectedTicketType._id } : "skip"
  );

  // Purchase tickets mutation
  const purchaseTickets = useMutation(api.tickets.purchaseTickets);
  const confirmTicketPayment = useMutation(api.tickets.confirmTicketPayment);
  const cancelTicketPayment = useMutation(api.tickets.cancelTicketPayment);

  const handleSelectTicket = (ticketType: any) => {
    setSelectedTicketType(ticketType);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setQuantity("1");
    setPurchaserName("");
    setPurchaserEmail("");
    setPurchaserPhone("");
    setAge("");
    setGender("");
    setSpecialRequirements("");
    setTransactionId("");
  };

  const handlePaystackSuccess = async (reference: any) => {
    try {
      setIsLoading(true);

      // Confirm the payment with our backend using the stored transaction ID
      const result = await confirmTicketPayment({
        transactionId: transactionId,
      });

      if (result.success) {
        toast.success("Payment successful! Your tickets have been confirmed.");
        setIsDialogOpen(false);
        resetForm();
        // Redirect to confirmation page
        router.push(`/tickets/confirmation/${transactionId}`);
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to confirm payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackClose = () => {
    // Cancel the pending payment when user closes Paystack
    if (transactionId) {
      cancelTicketPayment({ transactionId }).catch(console.error);
    }
    toast.info("Payment cancelled");
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInitiatePurchase = async () => {
    if (!selectedTicketType) return;

    // Validate form
    const quantityNumeric = parseInt(quantity);
    if (isNaN(quantityNumeric) || quantityNumeric <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    // Check availability with real-time count
    const realTimeAvailable = availableCounts ?? selectedTicketType.remaining;
    if (quantityNumeric > realTimeAvailable) {
      toast.error(
        "Not enough tickets available. Please refresh and try again."
      );
      return;
    }

    if (!purchaserName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(purchaserEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone (basic validation)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(purchaserPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      // Generate a unique transaction ID
      const transactionId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create the ticket purchase record
      const result = await purchaseTickets({
        ticketTypeId: selectedTicketType._id,
        eventId,
        quantity: quantityNumeric,
        purchaserName,
        purchaserEmail,
        purchaserPhone,
        transactionId,
        additionalDetails: {
          age: age ? parseInt(age) : undefined,
          gender: gender || undefined,
          specialRequirements: specialRequirements || undefined,
        },
      });

      if (result.success) {
        // Store transaction ID for Paystack
        setTransactionId(transactionId);
        // Payment will be handled by Paystack component
        toast.success("Purchase initiated! Please complete payment.");
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to initiate purchase");
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
            This is a voting-only event and does not have tickets for sale.
          </p>
        </div>
      </div>
    );
  }

  const totalPrice = selectedTicketType
    ? calculateTotalPrice(selectedTicketType.price, parseInt(quantity) || 1)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Event Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">{event.name}</h1>
              {event.description && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {event.description}
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString()} -{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </span>
                </div>
                {event.venue && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{event.venue}</span>
                  </div>
                )}
                {event.maxAttendees && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>Maximum {event.maxAttendees} attendees</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Tickets Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-semibold mb-2">
                  Available Tickets
                </h2>
                <p className="text-gray-600">
                  Choose your ticket type and secure your spot
                </p>
              </div>

              {ticketTypes.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No Tickets Available
                    </h3>
                    <p className="text-gray-500">
                      Ticket sales have not started yet or all tickets have been
                      sold. Please check back later.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {ticketTypes.map((ticketType) => {
                    // Use ticket type's remaining as fallback
                    const availableCount = ticketType.remaining;
                    const isAvailable = availableCount > 0;
                    const isOnSale =
                      (!ticketType.saleStartDate ||
                        Date.now() >= ticketType.saleStartDate) &&
                      (!ticketType.saleEndDate ||
                        Date.now() <= ticketType.saleEndDate);

                    return (
                      <Card
                        key={ticketType._id}
                        className={`relative transition-all duration-200 ${
                          isAvailable && isOnSale
                            ? "hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary"
                            : "opacity-60"
                        }`}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">
                              {ticketType.name}
                            </CardTitle>
                            {availableCount < 10 && availableCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                Only {availableCount} left
                              </Badge>
                            )}
                          </div>
                          {ticketType.description && (
                            <CardDescription className="text-sm">
                              {ticketType.description}
                            </CardDescription>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">
                              {formatTicketPrice(ticketType.price)}
                            </div>
                            <div className="text-sm text-gray-500">
                              per ticket
                            </div>
                          </div>

                          {ticketType.benefits &&
                            ticketType.benefits.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  What's included:
                                </h4>
                                <ul className="space-y-1">
                                  {ticketType.benefits.map((benefit, index) => (
                                    <li
                                      key={index}
                                      className="text-sm text-gray-600 flex items-center gap-2"
                                    >
                                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                      {benefit}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex justify-between">
                              <span>Available:</span>
                              <span className="font-medium">
                                {availableCount}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total:</span>
                              <span className="font-medium">
                                {ticketType.quantity}
                              </span>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={() => handleSelectTicket(ticketType)}
                            disabled={!isAvailable || !isOnSale}
                          >
                            {!isOnSale ? (
                              "Sale Not Active"
                            ) : !isAvailable ? (
                              "Sold Out"
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Buy Tickets
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Purchase Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Purchase Tickets
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTicketType &&
                      `Complete your purchase for ${selectedTicketType.name}`}
                  </DialogDescription>
                </DialogHeader>

                {selectedTicketType && (
                  <div className="space-y-6">
                    {/* Ticket Summary */}
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">
                              {selectedTicketType.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatTicketPrice(selectedTicketType.price)} per
                              ticket
                            </p>
                          </div>
                          <Badge>
                            {availableCounts ?? selectedTicketType.remaining}{" "}
                            available
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Purchase Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={Math.min(
                            availableCounts ?? selectedTicketType.remaining,
                            10
                          )}
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purchaserName">Full Name *</Label>
                        <Input
                          id="purchaserName"
                          placeholder="Your full name"
                          value={purchaserName}
                          onChange={(e) => setPurchaserName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purchaserEmail">Email Address *</Label>
                        <Input
                          id="purchaserEmail"
                          type="email"
                          placeholder="your.email@example.com"
                          value={purchaserEmail}
                          onChange={(e) => setPurchaserEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purchaserPhone">Phone Number *</Label>
                        <Input
                          id="purchaserPhone"
                          type="tel"
                          placeholder="+233 XX XXX XXXX"
                          value={purchaserPhone}
                          onChange={(e) => setPurchaserPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">Age (Optional)</Label>
                        <Input
                          id="age"
                          type="number"
                          min="1"
                          max="120"
                          placeholder="Your age"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender (Optional)</Label>
                        <Input
                          id="gender"
                          placeholder="Your gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialRequirements">
                        Special Requirements (Optional)
                      </Label>
                      <Input
                        id="specialRequirements"
                        placeholder="Any special requirements or notes"
                        value={specialRequirements}
                        onChange={(e) => setSpecialRequirements(e.target.value)}
                      />
                    </div>

                    {/* Order Summary */}
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">Order Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>
                              {selectedTicketType.name} × {quantity}
                            </span>
                            <span>{formatTicketPrice(totalPrice)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span>{formatTicketPrice(totalPrice)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Button */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>

                      {totalPrice > 0 && transactionId && (
                        <PaystackButton
                          email={purchaserEmail}
                          amount={totalPrice * 100} // Paystack expects amount in pesewas (kobo equivalent for GHS)
                          currency="GHS"
                          publicKey={
                            process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ""
                          }
                          text="Pay with Paystack"
                          reference={transactionId}
                          onSuccess={handlePaystackSuccess}
                          onClose={handlePaystackClose}
                          metadata={{
                            event_name: event.name,
                            ticket_type: selectedTicketType.name,
                            quantity: quantity,
                            purchaser_name: purchaserName,
                          }}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                          disabled={isLoading}
                        >
                          <CreditCard className="w-4 h-4" />
                          {isLoading
                            ? "Processing..."
                            : `Pay ${formatTicketPrice(totalPrice)}`}
                        </PaystackButton>
                      )}

                      {totalPrice > 0 && !transactionId && (
                        <Button
                          className="flex-1"
                          onClick={handleInitiatePurchase}
                          disabled={
                            isLoading ||
                            !purchaserName ||
                            !purchaserEmail ||
                            !purchaserPhone
                          }
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {isLoading ? "Processing..." : "Continue to Payment"}
                        </Button>
                      )}
                    </div>

                    {/* Info Note */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Payment Information</p>
                        <p>
                          Your tickets will be confirmed after successful
                          payment. You'll receive a confirmation email with your
                          ticket details and QR codes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
