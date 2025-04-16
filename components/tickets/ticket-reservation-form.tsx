"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Ticket, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TicketReservationFormProps {
  eventId: Id<"events">;
  onSuccess?: (reservationId: Id<"ticket_reservations">, ticketCode: string) => void;
}

export const TicketReservationForm: React.FC<TicketReservationFormProps> = ({
  eventId,
  onSuccess,
}) => {
  // State for form data
  const [ticketTypeId, setTicketTypeId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>("");
  const [buyerEmail, setBuyerEmail] = useState<string>("");
  const [buyerPhone, setBuyerPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch ticket types for this event
  const ticketTypes = useQuery(api.ticketTypes.getActiveTicketTypes, {
    eventId,
  });

  // Fetch event details
  const eventDetails = useQuery(api.events.getEvent, { eventId });

  // Create reservation mutation
  const createReservation = useMutation(api.ticketReservations.createTicketReservation);

  // Calculate total price
  const selectedTicketType = ticketTypes?.find(tt => tt._id === ticketTypeId);
  const totalPrice = selectedTicketType ? selectedTicketType.price * quantity : 0;

  // Reset form when event changes
  useEffect(() => {
    setTicketTypeId("");
    setQuantity(1);
    setError(null);
  }, [eventId]);

  // Set default ticket type if only one is available
  useEffect(() => {
    if (ticketTypes && ticketTypes.length === 1 && !ticketTypeId) {
      setTicketTypeId(ticketTypes[0]._id);
    }
  }, [ticketTypes, ticketTypeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Form validation
    if (!ticketTypeId) {
      setError("Please select a ticket type");
      return;
    }
    
    if (quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }
    
    if (!buyerName.trim()) {
      setError("Name is required");
      return;
    }
    
    if (!buyerEmail.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!buyerPhone.trim()) {
      setError("Phone number is required");
      return;
    }
    
    // Submit form
    setIsSubmitting(true);
    
    try {
      const result = await createReservation({
        ticketTypeId: ticketTypeId as Id<"ticket_types">,
        eventId,
        quantity,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim(),
      });
      
      toast.success("Ticket reservation successful!");
      
      // Call onSuccess callback if provided
      if (onSuccess && result.success) {
        onSuccess(result.reservationId, result.ticketCode);
      }
      
      // Reset form
      setTicketTypeId("");
      setQuantity(1);
      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("");
      
    } catch (err: any) {
      console.error("Error creating reservation:", err);
      setError(err.message || "Failed to create reservation. Please try again.");
      toast.error(err.message || "Failed to create reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!ticketTypes || !eventDetails) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading ticket information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No ticket types available
  if (ticketTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets Not Available</CardTitle>
          <CardDescription>
            There are no tickets available for this event at the moment.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Ticket className="mr-2 h-5 w-5 text-primary" />
          Reserve Tickets
        </CardTitle>
        <CardDescription>
          {eventDetails?.name} - {eventDetails?.location || ""}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Ticket Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="ticketType">Ticket Type</Label>
            <Select 
              value={ticketTypeId} 
              onValueChange={setTicketTypeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a ticket type" />
              </SelectTrigger>
              <SelectContent>
                {ticketTypes.map((type) => (
                  <SelectItem 
                    key={type._id} 
                    value={type._id}
                    disabled={type.remainingCapacity < 1}
                  >
                    {type.name} - {formatCurrency(type.price)} 
                    {type.remainingCapacity < 10 && ` (${type.remainingCapacity} left)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedTicketType?.benefits && (
              <p className="text-sm text-muted-foreground">
                Benefits: {selectedTicketType.benefits}
              </p>
            )}
          </div>
          
          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={selectedTicketType?.remainingCapacity || 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-16 text-center"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => setQuantity(Math.min((selectedTicketType?.remainingCapacity || 10), quantity + 1))}
                disabled={!selectedTicketType || quantity >= selectedTicketType.remainingCapacity}
              >
                +
              </Button>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="pt-2 border-t">
            <h3 className="text-sm font-medium mb-3">Contact Information</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          {selectedTicketType && (
            <div className="pt-4 border-t mt-6">
              <h3 className="text-sm font-medium mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm mb-1">
                <span>{selectedTicketType.name} x {quantity}</span>
                <span>{formatCurrency(selectedTicketType.price * quantity)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !ticketTypeId || quantity < 1}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue to Payment'
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground pt-2">
            By proceeding, you agree to our Terms and Conditions and Privacy Policy.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}; 