"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define error type
interface ConvexError {
  message: string;
}

export default function NewCategory() {
  const router = useRouter();
  const params = useParams();
  const { admin } = useAuthStore();
  const eventId = params.eventId as string;
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"popular_vote" | "judge_vote">(
    "popular_vote"
  );

  // Get event details
  const event = useQuery(api.events.getEvent, { eventId });

  // Create category mutation
  const createCategory = useMutation(api.categories.createCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) {
      toast.error("Event information is not available");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createCategory({
        name,
        description: description || undefined,
        eventId: event._id,
        type,
        adminId: admin!._id,
      });

      if (result.success) {
        toast.success("Category created successfully!");
        router.push(`/admin/events/${eventId}`);
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to create category");
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
        <h1 className="text-3xl font-bold">Add New Category</h1>
        <Link href={`/admin/events/${eventId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
              Fill in the details for the new voting category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Best Student"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of this category"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Category Type *</Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  setType(value as "popular_vote" | "judge_vote")
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular_vote">Popular Vote</SelectItem>
                  <SelectItem value="judge_vote">Judge Vote</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Popular Vote: Open to public voting. Judge Vote: Only for
                designated judges.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded text-sm">
              <p className="font-medium text-blue-700">Note:</p>
              <p className="text-blue-600">
                After creating a category, you'll need to add nominees who will
                compete in this category.
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
              {isLoading ? "Creating..." : "Create Category"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
