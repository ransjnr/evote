"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategoriesPage() {
  const { admin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  // Get department info
  const department = useQuery(
    api.departments.getDepartmentBySlug,
    admin?.departmentId ? { slug: admin.departmentId } : "skip"
  );

  // Get events for this department
  const events =
    useQuery(
      api.events.listEventsByDepartment,
      department ? { departmentId: department._id } : "skip"
    ) || [];

  // Prepare event IDs for fetching categories
  const eventIds = useMemo(() => events.map((event) => event._id), [events]);

  // Fetch all categories for the department
  const allCategoriesData =
    useQuery(
      api.categories.listCategoriesByDepartment,
      department ? { departmentId: department._id } : "skip"
    ) || [];

  // Fetch all nominee data for categories upfront
  const allNomineesData = useQuery(api.nominees.listAllNominees) || [];

  // Combine all categories with their event information
  const allCategories = useMemo(() => {
    return allCategoriesData.map((category) => {
      const event = events.find((e) => e._id === category.eventId);
      return {
        ...category,
        eventName: event?.name || "Unknown Event",
        eventId: category.eventId,
      };
    });
  }, [allCategoriesData, events]);

  // Group nominees by category
  const nomineeCountsByCategory = useMemo(() => {
    const counts = {};
    allNomineesData.forEach((nominee) => {
      if (!counts[nominee.categoryId]) {
        counts[nominee.categoryId] = 0;
      }
      counts[nominee.categoryId]++;
    });
    return counts;
  }, [allNomineesData]);

  // Apply filters
  const filteredCategories = useMemo(() => {
    return allCategories.filter((category) => {
      // Apply search filter
      const matchesSearch = category.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Apply event filter
      const matchesEvent =
        eventFilter === "all" || category.eventId === eventFilter;

      return matchesSearch && matchesEvent;
    });
  }, [allCategories, searchQuery, eventFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        {events.length > 0 && (
          <Link href={`/admin/events/${events[0]._id}/categories/new`}>
            <Button>Add New Category</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Categories</CardTitle>
          <CardDescription>
            Search and filter categories across all your events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories List</CardTitle>
          <CardDescription>
            Manage voting categories across all events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No categories found</p>
              {events.length > 0 ? (
                <Link href={`/admin/events/${events[0]._id}/categories/new`}>
                  <Button>Create Your First Category</Button>
                </Link>
              ) : (
                <Link href="/admin/events/new">
                  <Button>Create an Event First</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Nominees</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.eventName}</TableCell>
                      <TableCell>
                        {category.type === "popular_vote"
                          ? "Popular Vote"
                          : "Judge Vote"}
                      </TableCell>
                      <TableCell>
                        {nomineeCountsByCategory[category._id] || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/admin/categories/${category._id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link
                            href={`/admin/categories/${category._id}/nominees/new`}
                          >
                            <Button variant="outline" size="sm">
                              Add Nominee
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
