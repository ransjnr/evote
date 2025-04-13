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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Define error type
interface ConvexError {
  message: string;
}

export default function NomineeDetail() {
  const router = useRouter();
  const params = useParams();
  const { admin } = useAuthStore();
  const nomineeId = params.nomineeId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Get nominee details
  const nominee = useQuery(api.nominees.getNominee, { nomineeId });

  // Get category details if nominee is loaded
  const category = useQuery(
    api.categories.getCategory,
    nominee ? { categoryId: nominee.categoryId } : "skip"
  );

  // Get event details if category is loaded
  const event = useQuery(
    api.events.getEvent,
    category ? { eventId: category.eventId } : "skip"
  );

  // Get vote count for this nominee
  const voteCount =
    useQuery(
      api.nominees.getNomineeVoteCount,
      nominee ? { nomineeId: nominee._id } : "skip"
    ) || 0;

  // Update and delete nominee mutations
  const updateNominee = useMutation(api.nominees.updateNominee);
  const deleteNominee = useMutation(api.nominees.deleteNominee);

  // Initialize form with nominee data when loaded
  useEffect(() => {
    if (nominee) {
      setName(nominee.name);
      setDescription(nominee.description || "");
      setImageUrl(nominee.imageUrl || "");
      setVideoUrl(nominee.videoUrl || "");
    }
  }, [nominee]);

  const handleEditToggle = () => {
    if (isEditMode) {
      // Reset form when canceling edit
      setName(nominee?.name || "");
      setDescription(nominee?.description || "");
      setImageUrl(nominee?.imageUrl || "");
      setVideoUrl(nominee?.videoUrl || "");
    }
    setIsEditMode(!isEditMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nominee) {
      toast.error("Nominee information is not available");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateNominee({
        nomineeId: nominee._id,
        name,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
      });

      if (result.success) {
        toast.success("Nominee updated successfully!");
        setIsEditMode(false);
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to update nominee");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!nominee) return;

    setIsDeleting(true);
    try {
      await deleteNominee({
        nomineeId: nominee._id,
      });

      toast.success("Nominee deleted successfully!");
      setIsDeleteDialogOpen(false);
      if (category) {
        router.push(`/admin/categories/${category._id}`);
      } else {
        router.push("/admin/events");
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to delete nominee");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!nominee || !category || !event) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-500 mb-4">
            Please wait while we load the nominee details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{nominee.name}</h1>
          <p className="text-gray-500">
            Category: {category.name} | Event: {event.name}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="destructive" onClick={handleDeleteClick}>
            Delete Nominee
          </Button>
          <Button
            variant={isEditMode ? "outline" : "default"}
            onClick={handleEditToggle}
          >
            {isEditMode ? "Cancel Edit" : "Edit Nominee"}
          </Button>
          <Link href={`/admin/categories/${category._id}`}>
            <Button variant="outline">Back to Category</Button>
          </Link>
        </div>
      </div>

      {isEditMode ? (
        // Edit Form
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Edit Nominee</CardTitle>
              <CardDescription>Update the nominee's details</CardDescription>
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
              <Button
                variant="outline"
                type="button"
                onClick={handleEditToggle}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        // View Mode
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nominee Image/Media */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nominee.imageUrl ? (
                  <div className="aspect-square w-full overflow-hidden rounded-md">
                    <img
                      src={nominee.imageUrl}
                      alt={nominee.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-gray-100 flex items-center justify-center rounded-md">
                    <span className="text-gray-400">No Image Available</span>
                  </div>
                )}

                {nominee.videoUrl && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Video</h3>
                    <a
                      href={nominee.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Video
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Nominee Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-gray-600">
                  {nominee.description || "No description provided"}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-1">Category</h3>
                  <p>{category.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Event</h3>
                  <p>{event.name}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-1">Vote Count</h3>
                <p className="text-2xl font-bold">{voteCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{nominee.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Nominee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
