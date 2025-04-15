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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Nominee Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-gray-500 font-medium">Name</p>
                <p>{nominee.name}</p>
              </div>

              {nominee.description && (
                <div className="space-y-2">
                  <p className="text-gray-500 font-medium">Description</p>
                  <p>{nominee.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-gray-500 font-medium">USSD Code</p>
                <div className="flex items-center space-x-2">
                  <span className="inline-block bg-primary/10 text-primary font-mono text-lg px-4 py-2 rounded-md border border-primary/20">
                    {nominee.code}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(nominee.code);
                      toast.success("Code copied to clipboard!");
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  This code can be used for USSD voting integration. Share it
                  with voters to make voting easier.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-500 font-medium">Vote Count</p>
                <p className="text-2xl font-bold">{voteCount} votes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {nominee.imageUrl ? (
                <div className="space-y-2">
                  <p className="text-gray-500 font-medium">Image</p>
                  <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={nominee.imageUrl}
                      alt={nominee.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-500 font-medium">Image</p>
                  <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-400">No image available</p>
                  </div>
                </div>
              )}

              {nominee.videoUrl && (
                <div className="space-y-2">
                  <p className="text-gray-500 font-medium">Video</p>
                  <a
                    href={nominee.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {nominee.videoUrl}
                  </a>
                </div>
              )}
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
