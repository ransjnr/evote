"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Ticket } from "lucide-react";

export default function TicketTypes() {
  const params = useParams();
  const { admin } = useAuthStore();
  const eventId = params.eventId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<
    string | null
  >(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [benefits, setBenefits] = useState("");
  const [saleStartDate, setSaleStartDate] = useState("");
  const [saleEndDate, setSaleEndDate] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get event details
  const event = useQuery(api.events.getEvent, { eventId });

  // Get ticket types
  const ticketTypes = useQuery(api.tickets.getTicketTypes, { eventId }) || [];

  // Mutations
  const createTicketType = useMutation(api.tickets.createTicketType);
  const updateTicketType = useMutation(api.tickets.updateTicketType);
  const deleteTicketType = useMutation(api.tickets.deleteTicketType);
  const adminCleanupExpiredPayments = useMutation(
    api.tickets.adminCleanupExpiredPayments
  );

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setQuantity("");
    setBenefits("");
    setSaleStartDate("");
    setSaleEndDate("");
    setIsEditMode(false);
    setSelectedTicketTypeId(null);
  };

  const handleEdit = (ticketType: any) => {
    setName(ticketType.name);
    setDescription(ticketType.description || "");
    setPrice(ticketType.price.toString());
    setQuantity(ticketType.quantity.toString());
    setBenefits(ticketType.benefits?.join("\n") || "");
    setSaleStartDate(
      ticketType.saleStartDate
        ? new Date(ticketType.saleStartDate).toISOString().slice(0, 16)
        : ""
    );
    setSaleEndDate(
      ticketType.saleEndDate
        ? new Date(ticketType.saleEndDate).toISOString().slice(0, 16)
        : ""
    );
    setIsEditMode(true);
    setSelectedTicketTypeId(ticketType._id);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTicketTypeId) return;

    setIsLoading(true);
    try {
      await deleteTicketType({
        ticketTypeId: selectedTicketTypeId,
      });

      toast.success("Ticket type deleted successfully!");
      setIsDeleteDialogOpen(false);
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to delete ticket type");
    } finally {
      setIsLoading(false);
      setSelectedTicketTypeId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate price
    const priceNumeric = parseFloat(price);
    if (isNaN(priceNumeric) || priceNumeric <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    // Validate quantity
    const quantityNumeric = parseInt(quantity);
    if (isNaN(quantityNumeric) || quantityNumeric <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    // Validate dates if provided
    if (saleStartDate && saleEndDate) {
      const startTimestamp = new Date(saleStartDate).getTime();
      const endTimestamp = new Date(saleEndDate).getTime();
      if (startTimestamp >= endTimestamp) {
        toast.error("Sale end date must be after sale start date");
        return;
      }
    }

    // Parse benefits
    const benefitsArray = benefits
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    setIsLoading(true);

    try {
      if (isEditMode && selectedTicketTypeId) {
        await updateTicketType({
          ticketTypeId: selectedTicketTypeId,
          name,
          description: description || undefined,
          price: priceNumeric,
          quantity: quantityNumeric,
          benefits: benefitsArray.length > 0 ? benefitsArray : undefined,
          saleStartDate: saleStartDate
            ? new Date(saleStartDate).getTime()
            : undefined,
          saleEndDate: saleEndDate
            ? new Date(saleEndDate).getTime()
            : undefined,
        });

        toast.success("Ticket type updated successfully!");
      } else {
        await createTicketType({
          name,
          description: description || undefined,
          eventId,
          price: priceNumeric,
          quantity: quantityNumeric,
          benefits: benefitsArray.length > 0 ? benefitsArray : undefined,
          adminId: admin!._id,
          saleStartDate: saleStartDate
            ? new Date(saleStartDate).getTime()
            : undefined,
          saleEndDate: saleEndDate
            ? new Date(saleEndDate).getTime()
            : undefined,
        });

        toast.success("Ticket type created successfully!");
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(
        convexError.message ||
          `Failed to ${isEditMode ? "update" : "create"} ticket type`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupExpiredPayments = async () => {
    if (!admin?._id) return;

    setIsLoading(true);
    try {
      const result = await adminCleanupExpiredPayments({
        adminId: admin._id,
      });

      toast.success(
        `Cleanup completed! Cleaned ${result.expiredPayments} expired payments and ${result.cleanedTickets} pending tickets.`
      );
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to cleanup expired payments");
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
            This is a voting-only event and does not support ticketing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ticket Types</h1>
          <p className="text-gray-500 mt-1">
            Manage ticket types for {event.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCleanupExpiredPayments}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Cleanup Expired
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ticket Type
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit" : "Add"} Ticket Type
                </DialogTitle>
                <DialogDescription>
                  {isEditMode ? "Update the" : "Create a new"} ticket type for
                  this event
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. VIP Ticket"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the ticket type"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₵) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 100.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">
                    Benefits (Optional, one per line)
                  </Label>
                  <Input
                    id="benefits"
                    placeholder="Enter benefits, one per line"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="h-24"
                    multiple
                  />
                  <p className="text-xs text-gray-500">
                    Enter each benefit on a new line
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="saleStartDate">
                      Sale Start Date (Optional)
                    </Label>
                    <Input
                      id="saleStartDate"
                      type="datetime-local"
                      value={saleStartDate}
                      onChange={(e) => setSaleStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saleEndDate">
                      Sale End Date (Optional)
                    </Label>
                    <Input
                      id="saleEndDate"
                      type="datetime-local"
                      value={saleEndDate}
                      onChange={(e) => setSaleEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update"
                      : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {ticketTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Ticket className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ticket Types Yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Create your first ticket type to start selling tickets for this
              event.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ticket Type
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Sale Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketTypes.map((ticketType) => (
                <TableRow key={ticketType._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ticketType.name}</p>
                      {ticketType.description && (
                        <p className="text-sm text-gray-500">
                          {ticketType.description}
                        </p>
                      )}
                      {ticketType.benefits &&
                        ticketType.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ticketType.benefits.map((benefit, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>₵{ticketType.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ticketType.remaining > 0 ? "success" : "destructive"
                      }
                    >
                      {ticketType.remaining} / {ticketType.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticketType.saleStartDate && ticketType.saleEndDate ? (
                      <div className="text-sm">
                        <p>
                          From:{" "}
                          {new Date(
                            ticketType.saleStartDate
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          To:{" "}
                          {new Date(
                            ticketType.saleEndDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-500">No restrictions</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ticketType)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTicketTypeId(ticketType._id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket type? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
