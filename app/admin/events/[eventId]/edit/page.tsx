"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/stores/auth-store";
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

// Define error type
interface ConvexError {
  message: string;
}

export default function EditEvent() {
  const router = useRouter();
  const params = useParams();
  const { admin } = useAuthStore();
  const eventId = params.eventId as string;
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [votePrice, setVotePrice] = useState("");

  // Get event details
  const event = useQuery(api.events.getEvent, { eventId });

  // Get department info
  const department = useQuery(
    api.departments.getDepartmentBySlug,
    admin?.departmentId ? { slug: admin.departmentId } : "skip"
  );

  // Update event mutation
  const updateEvent = useMutation(api.events.updateEvent);

  // Initialize form with event data when available
  useEffect(() => {
    if (event) {
      setName(event.name);
      setDescription(event.description || "");

      // Format dates for datetime-local input
      const formatDateForInput = (timestamp: number) => {
        const date = new Date(timestamp);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      };

      setStartDate(formatDateForInput(event.startDate));
      setEndDate(formatDateForInput(event.endDate));
      setVotePrice(event.votePrice.toString());
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) {
      toast.error("Event information is not available");
      return;
    }

    // Validate vote price
    const votePriceNumeric = parseFloat(votePrice);
    if (isNaN(votePriceNumeric) || votePriceNumeric <= 0) {
      toast.error("Vote price must be greater than 0");
      return;
    }

    // Convert dates to timestamps
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();

    if (startTimestamp >= endTimestamp) {
      toast.error("End date must be after start date");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateEvent({
        eventId: event._id,
        name,
        description: description || undefined,
        startDate: startTimestamp,
        endDate: endTimestamp,
        votePrice: votePriceNumeric,
      });

      if (result.success) {
        toast.success("Event updated successfully!");
        router.push(`/admin/events/${eventId}`);
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to update event");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <Link href={`/admin/events/${eventId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Update the details for your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Annual Department Awards 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of the event"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="votePrice">Vote Price (₵) *</Label>
              <Input
                id="votePrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 5.00"
                value={votePrice}
                onChange={(e) => setVotePrice(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                This is the amount voters will pay for each vote
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Link href={`/admin/events/${eventId}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Event"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
