"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Medal,
  Award,
  Star,
  Badge,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeaderboardPage() {
  const { admin } = useAuthStore();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState("all");

  // Get department info using slug
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

  // Set the first event as selected if none is selected
  useMemo(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]._id);
    }
  }, [events, selectedEvent]);

  // Get all votes
  const allVotes = useQuery(api.voting.getAllVotes) || [];

  // Get all categories for the selected event
  const eventCategories =
    useQuery(
      api.categories.listCategoriesByEvent,
      selectedEvent ? { eventId: selectedEvent } : "skip"
    ) || [];

  // Get all nominees
  const allNominees = useQuery(api.nominees.listAllNominees) || [];

  // Filter votes by time frame
  const filteredVotes = useMemo(() => {
    let votes = allVotes;

    // Apply event filter
    if (selectedEvent) {
      votes = votes.filter((vote) => vote.eventId === selectedEvent);
    }

    // Apply time frame filter
    if (timeFrame !== "all") {
      const now = Date.now();
      let cutoffTime = 0;

      switch (timeFrame) {
        case "day":
          cutoffTime = now - 24 * 60 * 60 * 1000; // 24 hours
          break;
        case "week":
          cutoffTime = now - 7 * 24 * 60 * 60 * 1000; // 7 days
          break;
        case "month":
          cutoffTime = now - 30 * 24 * 60 * 60 * 1000; // 30 days
          break;
      }

      votes = votes.filter((vote) => vote.createdAt >= cutoffTime);
    }

    return votes;
  }, [allVotes, selectedEvent, timeFrame]);

  // Calculate top nominees
  const topNominees = useMemo(() => {
    const nomineeVoteCounts = {};

    // Count votes per nominee
    filteredVotes.forEach((vote) => {
      if (!nomineeVoteCounts[vote.nomineeId]) {
        nomineeVoteCounts[vote.nomineeId] = {
          count: 0,
          amount: 0,
        };
      }
      nomineeVoteCounts[vote.nomineeId].count++;
      nomineeVoteCounts[vote.nomineeId].amount += vote.amount;
    });

    // Create array of nominees with vote counts
    const nominees = Object.entries(nomineeVoteCounts).map(
      ([nomineeId, stats]) => {
        const nominee = allNominees.find((n) => n._id === nomineeId);
        const category = nominee
          ? eventCategories.find((c) => c._id === nominee.categoryId)
          : null;

        return {
          id: nomineeId,
          name: nominee?.name || "Unknown Nominee",
          votes: stats.count,
          amount: stats.amount,
          category: category?.name || "Unknown Category",
          imageUrl: nominee?.imageUrl || null,
        };
      }
    );

    // Sort by vote count (descending)
    return nominees.sort((a, b) => b.votes - a.votes).slice(0, 10);
  }, [filteredVotes, allNominees, eventCategories]);

  // Calculate top categories
  const topCategories = useMemo(() => {
    const categoryVoteCounts = {};

    // Count votes per category
    filteredVotes.forEach((vote) => {
      if (!categoryVoteCounts[vote.categoryId]) {
        categoryVoteCounts[vote.categoryId] = {
          count: 0,
          amount: 0,
        };
      }
      categoryVoteCounts[vote.categoryId].count++;
      categoryVoteCounts[vote.categoryId].amount += vote.amount;
    });

    // Create array of categories with vote counts
    const categories = Object.entries(categoryVoteCounts).map(
      ([categoryId, stats]) => {
        const category = eventCategories.find((c) => c._id === categoryId);

        return {
          id: categoryId,
          name: category?.name || "Unknown Category",
          votes: stats.count,
          amount: stats.amount,
          type: category?.type || "unknown",
        };
      }
    );

    // Sort by vote count (descending)
    return categories.sort((a, b) => b.votes - a.votes).slice(0, 5);
  }, [filteredVotes, eventCategories]);

  // Calculate total votes and revenue
  const stats = useMemo(() => {
    // Total votes
    const totalVotes = filteredVotes.length;

    // Total revenue
    const totalRevenue = filteredVotes.reduce(
      (sum, vote) => sum + vote.amount,
      0
    );

    // Highest single nominee vote count
    const highestVotes = topNominees.length > 0 ? topNominees[0].votes : 0;

    // Fastest growing nominee (needs implementation with time-based data)

    return {
      totalVotes,
      totalRevenue,
      highestVotes,
    };
  }, [filteredVotes, topNominees]);

  // Get event name from ID
  const getEventName = (eventId) => {
    const event = events.find((e) => e._id === eventId);
    return event ? event.name : "All Events";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get avatar initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get icon for rank position
  const getRankIcon = (position) => {
    switch (position) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Badge className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Sparkles className="mr-2 h-6 w-6 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-gray-500 mt-1">
            Track top nominees, categories, and voting trends
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedEvent || ""} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event._id} value={event._id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center">
              <Star className="mr-2 h-4 w-4" />
              Total Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">
              {stats.totalVotes}
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              {selectedEvent
                ? `For ${getEventName(selectedEvent)}`
                : "Across all events"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center">
              <Award className="mr-2 h-4 w-4" />
              Revenue Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-sm text-emerald-700 mt-1">
              From voting activities
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {stats.highestVotes}
            </div>
            <p className="text-sm text-purple-700 mt-1">
              Votes for leading nominee
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="nominees" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="nominees">Top Nominees</TabsTrigger>
          <TabsTrigger value="categories">Top Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="nominees" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Leading Nominees</CardTitle>
              <CardDescription>
                Top performers based on vote count
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topNominees.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No votes recorded yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {topNominees.map((nominee, index) => {
                    // Calculate max votes for relative progress bar
                    const maxVotes = topNominees[0].votes;
                    const percentOfLeader = (nominee.votes / maxVotes) * 100;

                    return (
                      <div key={nominee.id} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 text-center">
                          {getRankIcon(index)}
                        </div>
                        <Avatar className="border-2 border-white shadow-sm flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                            <div className="font-medium truncate">
                              {nominee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {nominee.category}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Progress
                              value={percentOfLeader}
                              className="h-2 flex-1"
                            />
                            <div className="text-sm font-medium w-16 text-right">
                              {nominee.votes} votes
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>
                Categories with the most engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topCategories.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No votes recorded yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {topCategories.map((category, index) => {
                    // Calculate max votes for relative progress bar
                    const maxVotes = topCategories[0].votes;
                    const percentOfLeader = (category.votes / maxVotes) * 100;

                    return (
                      <div
                        key={category.id}
                        className="flex items-center gap-4"
                      >
                        <div className="flex-shrink-0 w-8 text-center">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                            <div className="font-medium">{category.name}</div>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">
                                {category.type === "popular_vote"
                                  ? "Popular Vote"
                                  : "Judge Vote"}
                              </span>
                              <span className="text-sm font-medium">
                                {formatCurrency(category.amount)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Progress
                              value={percentOfLeader}
                              className="h-2 flex-1"
                            />
                            <div className="text-sm font-medium w-16 text-right">
                              {category.votes} votes
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Coming Soon - Gamification Features */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-dashed border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5 text-indigo-500" />
            Coming Soon: Enhanced Gamification
          </CardTitle>
          <CardDescription>Exciting new features on the way!</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium mb-1 flex items-center">
              <Trophy className="mr-2 h-4 w-4 text-amber-500" /> Contestant
              Badges
            </h3>
            <p className="text-sm text-gray-500">
              Award special badges to top performers based on voting milestones.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium mb-1 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-emerald-500" /> Real-time
              Race View
            </h3>
            <p className="text-sm text-gray-500">
              Visualize the voting race with an animated real-time leaderboard.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium mb-1 flex items-center">
              <Sparkles className="mr-2 h-4 w-4 text-purple-500" /> Social
              Sharing
            </h3>
            <p className="text-sm text-gray-500">
              Let contestants share their ranking with built-in social media
              cards.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
