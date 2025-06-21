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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PlusIcon } from "lucide-react";

// Define error type
interface ConvexError {
  message: string;
}

export default function CategoryDetail() {
  const router = useRouter();
  const params = useParams();
  const { admin } = useAuthStore();
  const categoryId = params.categoryId as string;
  const [activeTab, setActiveTab] = useState("overview");

  // Get category details
  const category = useQuery(api.categories.getCategory, { categoryId });

  // Get event details if category is loaded
  const event = useQuery(
    api.events.getEvent,
    category ? { eventId: category.eventId } : "skip"
  );

  // Get nominees for this category
  const nominees =
    useQuery(
      api.nominees.listNomineesByCategory,
      category ? { categoryId: category._id } : "skip"
    ) || [];

  // Get department info
  const department = useQuery(
    api.departments.getDepartmentBySlug,
    admin?.departmentId ? { slug: admin.departmentId } : "skip"
  );

  // Update category mutation
  const updateCategory = useMutation(api.categories.updateCategory);

  // Delete category mutation
  const deleteCategory = useMutation(api.categories.deleteCategory);

  if (!category || !event) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading category...</h2>
          <p className="text-gray-500 mb-4">
            Please wait while we load the category details
          </p>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await deleteCategory({ categoryId: category._id });
      toast.success("Category deleted successfully");
      router.push(`/admin/events/${event._id}`);
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <Badge
              variant={
                category.type === "popular_vote" ? "default" : "secondary"
              }
            >
              {category.type === "popular_vote" ? "Popular Vote" : "Judge Vote"}
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">{event.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={`/admin/categories/${categoryId}/edit`}>
            <Button variant="outline">Edit Category</Button>
          </Link>
          <Link href={`/admin/events/${event._id}`}>
            <Button variant="outline">Back to Event</Button>
          </Link>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nominees">
            Nominees ({nominees.length})
          </TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                View and manage details for this category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-gray-600">
                  {category.description || "No description provided"}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-1">Type</h3>
                  <p>
                    {category.type === "popular_vote"
                      ? "Popular Vote"
                      : "Judge Vote"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Event</h3>
                  <p>{event.name}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleDelete}>
                Delete Category
              </Button>
              <Link href={`/admin/categories/${categoryId}/edit`}>
                <Button variant="outline">Edit Category</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="nominees" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Nominees</CardTitle>
                <CardDescription>
                  Manage nominees for this category
                </CardDescription>
              </div>
              <div className="flex space-x-3">
                {nominees.length > 0 && (
                  <Link href={`/admin/categories/${categoryId}/flyers`}>
                    <Button variant="outline" className="gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="18"
                          height="18"
                          x="3"
                          y="3"
                          rx="2"
                          ry="2"
                        />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      Generate Flyers
                    </Button>
                  </Link>
                )}
                <Link
                  href={`/admin/nominees/import?categoryId=${categoryId}&eventId=${category.eventId}`}
                >
                  <Button variant="outline" className="gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Import CSV
                  </Button>
                </Link>
                <Link href={`/admin/categories/${categoryId}/nominees/new`}>
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" /> Add Nominee
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {nominees.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No nominees added yet</p>
                  <Link href={`/admin/categories/${categoryId}/nominees/new`}>
                    <Button>Add Your First Nominee</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nominees.map((nominee) => (
                    <Card key={nominee._id} className="overflow-hidden">
                      <div className="h-36 bg-gray-100 flex items-center justify-center">
                        {nominee.imageUrl ? (
                          <img
                            src={nominee.imageUrl}
                            alt={nominee.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-lg mb-1">
                          {nominee.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {nominee.description || "No description provided"}
                        </p>
                        <Link href={`/admin/nominees/${nominee._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Manage
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voting Results</CardTitle>
              <CardDescription>
                View voting statistics for this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">
                  {event.isActive
                    ? "Voting is currently in progress"
                    : "Event is not active yet"}
                </p>
                <Link href={`/admin/events/${event._id}/results`}>
                  <Button>View Detailed Results</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
