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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NomineesPage() {
  const { admin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  // Get all categories for this department
  const allCategoriesData =
    useQuery(
      api.categories.listCategoriesByDepartment,
      department ? { departmentId: department._id } : "skip"
    ) || [];

  // Get all nominees for this department
  const allNomineesData =
    useQuery(
      api.nominees.listNomineesByDepartment,
      department ? { departmentId: department._id } : "skip"
    ) || [];

  // Get all votes data - fetch it once and process locally
  const allVotes = useQuery(api.voting.getAllVotes) || [];

  // Combine categories with their event information
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

  // Create vote count mapping by processing the votes data
  const voteCountsByNominee = useMemo(() => {
    const counts = {};
    // Initialize all nominee IDs with zero votes
    allNomineesData.forEach((nominee) => {
      counts[nominee._id] = 0;
    });

    // Count votes for each nominee
    allVotes.forEach((vote) => {
      if (counts[vote.nomineeId] !== undefined) {
        counts[vote.nomineeId]++;
      }
    });

    return counts;
  }, [allNomineesData, allVotes]);

  // Combine all nominees with their category and event information
  const allNominees = useMemo(() => {
    return allNomineesData
      .map((nominee) => {
        const category = allCategories.find(
          (c) => c._id === nominee.categoryId
        );
        if (!category) {
          return null; // Skip nominees with invalid category
        }

        return {
          ...nominee,
          categoryName: category.name,
          categoryId: category._id,
          eventName: category.eventName,
          eventId: category.eventId,
        };
      })
      .filter(Boolean); // Remove null entries
  }, [allNomineesData, allCategories]);

  // Apply filters
  const filteredNominees = useMemo(() => {
    return allNominees.filter((nominee) => {
      // Apply search filter
      const matchesSearch = nominee.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Apply category filter
      const matchesCategory =
        categoryFilter === "all" || nominee.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [allNominees, searchQuery, categoryFilter]);

  // Get the initials for the avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nominees</h1>
        {allCategories.length > 0 && (
          <Link href={`/admin/categories/${allCategories[0]._id}/nominees/new`}>
            <Button>Add New Nominee</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Nominees</CardTitle>
          <CardDescription>
            Search and filter nominees across all categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search nominees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name} ({category.eventName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Nominees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Nominees List</CardTitle>
          <CardDescription>
            Manage all nominees across your categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNominees.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No nominees found</p>
              {allCategories.length > 0 ? (
                <Link
                  href={`/admin/categories/${allCategories[0]._id}/nominees/new`}
                >
                  <Button>Add Your First Nominee</Button>
                </Link>
              ) : (
                <Link href="/admin/events/new">
                  <Button>Create an Event and Categories First</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nominee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNominees.map((nominee) => (
                    <TableRow key={nominee._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {nominee.imageUrl ? (
                              <AvatarImage
                                src={nominee.imageUrl}
                                alt={nominee.name}
                              />
                            ) : null}
                            <AvatarFallback>
                              {getInitials(nominee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{nominee.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{nominee.categoryName}</TableCell>
                      <TableCell>{nominee.eventName}</TableCell>
                      <TableCell>
                        {voteCountsByNominee[nominee._id] || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/admin/nominees/${nominee._id}`}>
                            <Button variant="outline" size="sm">
                              View
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
