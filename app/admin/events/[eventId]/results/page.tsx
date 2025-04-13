"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function EventResults() {
  const router = useRouter();
  const params = useParams();
  const { admin } = useAuthStore();
  const eventId = params.eventId as string;
  const [activeTab, setActiveTab] = useState<string>("");

  // Get event details
  const event = useQuery(api.events.getEvent, { eventId });

  // Get vote statistics for this event
  const voteStats = useQuery(
    api.voting.getEventVoteStats,
    event ? { eventId: event._id } : "skip"
  );

  // Set first category as active when data loads
  useEffect(() => {
    if (voteStats?.categories?.length > 0 && !activeTab) {
      setActiveTab(voteStats.categories[0].categoryId);
    }
  }, [voteStats, activeTab]);

  if (!event || !voteStats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading results...</h2>
          <p className="text-gray-500 mb-4">
            Please wait while we load the voting results
          </p>
        </div>
      </div>
    );
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  });

  const formatCurrency = (amount: number) => {
    return formatter.format(amount);
  };

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
        <div>
          <h1 className="text-3xl font-bold">Results: {event.name}</h1>
          <p className="text-gray-500">
            Voting statistics and results for this event
          </p>
        </div>
        <Link href={`/admin/events/${eventId}`}>
          <Button variant="outline">Back to Event</Button>
        </Link>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              Total Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {voteStats.totalVotes}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {formatCurrency(voteStats.totalAmount)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {voteStats.categories.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">
              Average Revenue / Vote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">
              {voteStats.totalVotes > 0
                ? formatCurrency(voteStats.totalAmount / voteStats.totalVotes)
                : formatCurrency(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution Visualization */}
      {voteStats.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vote Distribution by Category</CardTitle>
            <CardDescription>
              Comparison of votes across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {voteStats.categories.map((category) => (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <div className="text-right">
                      <span className="font-medium">{category.voteCount}</span>
                      <span className="text-gray-500 text-sm ml-1">votes</span>
                      <span className="text-gray-500 text-sm ml-2">
                        (
                        {voteStats.totalVotes > 0
                          ? `${Math.round((category.voteCount / voteStats.totalVotes) * 100)}%`
                          : "0%"}
                        )
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      voteStats.totalVotes > 0
                        ? (category.voteCount / voteStats.totalVotes) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {voteStats.categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-gray-500 mb-4">No voting data available yet</p>
            <Link href={`/admin/events/${eventId}`}>
              <Button>Back to Event</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results by Category</CardTitle>
            <CardDescription>
              Breakdown of votes for each nominee within categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-8"
            >
              <TabsList className="flex flex-wrap justify-start mb-2">
                {voteStats.categories.map((category) => (
                  <TabsTrigger
                    key={category.categoryId}
                    value={category.categoryId}
                    className="text-sm md:text-base"
                  >
                    {category.name} ({category.voteCount})
                  </TabsTrigger>
                ))}
              </TabsList>

              {voteStats.categories.map((category) => {
                // Find the highest vote count for scaling
                const maxVotes =
                  category.nominees.length > 0
                    ? Math.max(...category.nominees.map((n) => n.voteCount))
                    : 0;

                // Calculate total votes in this category
                const totalCategoryVotes = category.voteCount;

                return (
                  <TabsContent
                    key={category.categoryId}
                    value={category.categoryId}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">
                          {category.name}
                        </h2>
                        <p className="text-gray-500">
                          Total Votes: {category.voteCount} | Revenue:{" "}
                          {formatCurrency(category.amount)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {category.nominees.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No nominees or votes for this category yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {category.nominees.map((nominee, index) => {
                          // Calculate percentage of votes for this nominee
                          const percentage =
                            totalCategoryVotes > 0
                              ? Math.round(
                                  (nominee.voteCount / totalCategoryVotes) * 100
                                )
                              : 0;

                          return (
                            <div key={nominee.nomineeId} className="relative">
                              <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0">
                                  <Avatar className="h-12 w-12">
                                    <AvatarFallback
                                      className={
                                        index === 0 && category.voteCount > 0
                                          ? "bg-yellow-100 text-yellow-800"
                                          : ""
                                      }
                                    >
                                      {getInitials(nominee.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>

                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-lg">
                                        {nominee.name}
                                      </span>
                                      {index === 0 &&
                                        category.voteCount > 0 && (
                                          <Badge className="bg-yellow-500">
                                            Leading
                                          </Badge>
                                        )}
                                    </div>
                                    <div className="text-right">
                                      <span className="font-bold text-lg">
                                        {nominee.voteCount}
                                      </span>
                                      <span className="text-gray-500 text-sm ml-1">
                                        votes
                                      </span>
                                      <span className="font-medium text-sm ml-2 text-gray-500">
                                        ({percentage}%)
                                      </span>
                                    </div>
                                  </div>

                                  <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                      <div>
                                        <span className="text-xs text-gray-500">
                                          Revenue:{" "}
                                          {formatCurrency(nominee.amount)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="flex-1 mr-4">
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                          <div
                                            className={`h-4 rounded-full ${
                                              index === 0 &&
                                              category.voteCount > 0
                                                ? "bg-yellow-500"
                                                : index === 1
                                                  ? "bg-gray-500"
                                                  : index === 2
                                                    ? "bg-amber-700"
                                                    : "bg-blue-500"
                                            }`}
                                            style={{
                                              width: `${
                                                maxVotes > 0
                                                  ? (nominee.voteCount /
                                                      maxVotes) *
                                                    100
                                                  : 0
                                              }%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                      <div className="w-12 text-right">
                                        <span className="text-xs font-semibold inline-block text-blue-600">
                                          {percentage}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button variant="outline" onClick={() => window.print()}>
              Export Results
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
