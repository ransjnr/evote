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
import { Textarea } from "@/components/ui/textarea";

// Define error type
interface ConvexError {
  message: string;
}

export default function AddNominee() {
  const router = useRouter();
  const params = useParams();
  const { admin } = useAuthStore();
  const categoryId = params.categoryId as string;
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Get category details
  const category = useQuery(api.categories.getCategory, { categoryId });

  // Get event details if category is loaded
  const event = useQuery(
    api.events.getEvent,
    category ? { eventId: category.eventId } : "skip"
  );

  // Create nominee mutation
  const createNominee = useMutation(api.nominees.createNominee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast.error("Category information is not available");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createNominee({
        name,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
        categoryId: category._id,
        adminId: admin!._id,
      });

      if (result.success) {
        toast.success("Nominee added successfully!");
        router.push(`/admin/categories/${categoryId}`);
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to add nominee");
    } finally {
      setIsLoading(false);
    }
  };

  if (!category || !event) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-500 mb-4">
            Please wait while we load the category details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add New Nominee</h1>
          <p className="text-gray-500">
            Adding to category: {category.name} in event: {event.name}
          </p>
        </div>
        <Link href={`/admin/categories/${categoryId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Nominee Details</CardTitle>
            <CardDescription>
              Fill in the details for the new nominee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nominee Name *</Label>
              <Input
                id="name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this nominee"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter a URL to an image of the nominee
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Optionally provide a YouTube or other video URL
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Link href={`/admin/categories/${categoryId}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Nominee"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
