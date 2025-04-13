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
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Award,
} from "lucide-react";

export default function AnalyticsPage() {
  const { admin } = useAuthStore();
  const [eventFilter, setEventFilter] = useState("all");
  const [viewType, setViewType] = useState<
    "overview" | "events" | "categories" | "nominees"
  >("overview");

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

  // Get event IDs for the first 10 events
  const eventIds = useMemo(() => {
    return events.slice(0, 10).map((event) => event._id);
  }, [events]);

  // Fetch stats for each event (always calling the same number of hooks)
  const event0Stats = useQuery(
    api.voting.getEventVoteStats,
    eventIds.length > 0 ? { eventId: eventIds[0] } : "skip"
  );
  const event1Stats = useQuery(
    api.voting.getEventVoteStats,
    eventIds.length > 1 ? { eventId: eventIds[1] } : "skip"
  );
  const event2Stats = useQuery(
    api.voting.getEventVoteStats,
    eventIds.length > 2 ? { eventId: eventIds[2] } : "skip"
  );
  const event3Stats = useQuery(
    api.voting.getEventVoteStats,
    eventIds.length > 3 ? { eventId: eventIds[3] } : "skip"
  );
  const event4Stats = useQuery(
    api.voting.getEventVoteStats,
    eventIds.length > 4 ? { eventId: eventIds[4] } : "skip"
  );
  const event5Stats = useQuery(
    api.voting.getEventVoteStats,
    eventIds.length > 5 ? { eventId: eventIds[5] } : "skip"
  );
  const event6Stats = useQuery(
    api.voting.getEventVoteStats,
    eventIds.length > 6 ? { eventId: eventIds[6] } : "skip"
  );
  const event7Stats = useQuery(
    api.voting.getEventVoteStats,
    eventIds.length > 7 ? { eventId: eventIds[7] } : "skip"
  );
  const event8Stats = useQuery(
    api.voting.getEventVoteStats,
    eventIds.length > 8 ? { eventId: eventIds[8] } : "skip"
  );
  const event9Stats = useQuery(
    api.voting.getEventVoteStats,
    eventIds.length > 9 ? { eventId: eventIds[9] } : "skip"
  );

  // Combine events with their stats
  const allEventStats = useMemo(() => {
    const statsArray = [
      event0Stats,
      event1Stats,
      event2Stats,
      event3Stats,
      event4Stats,
      event5Stats,
      event6Stats,
      event7Stats,
      event8Stats,
      event9Stats,
    ];

    return events
      .slice(0, 10) // Limit to first 10 events to match our queries
      .map((event, index) => ({
        event,
        stats: statsArray[index],
      }))
      .filter((item) => item.stats);
  }, [
    events,
    event0Stats,
    event1Stats,
    event2Stats,
    event3Stats,
    event4Stats,
    event5Stats,
    event6Stats,
    event7Stats,
    event8Stats,
    event9Stats,
  ]);

  // Formatter for currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate department-wide totals
  const totalStats = useMemo(() => {
    return {
      votes: allEventStats.reduce(
        (sum, item) => sum + (item.stats?.totalVotes || 0),
        0
      ),
      revenue: allEventStats.reduce(
        (sum, item) => sum + (item.stats?.totalAmount || 0),
        0
      ),
      categories: allEventStats.reduce(
        (sum, item) => sum + (item.stats?.categories?.length || 0),
        0
      ),
      nominees: allEventStats.reduce((sum, item) => {
        const nomineesCount =
          item.stats?.categories?.reduce(
            (catSum, cat) => catSum + (cat.nominees?.length || 0),
            0
          ) || 0;
        return sum + nomineesCount;
      }, 0),
    };
  }, [allEventStats]);

  // Create data for the charts
  const eventRevenueData = useMemo(() => {
    return allEventStats
      .map((item) => ({
        name: item.event.name,
        votes: item.stats?.totalVotes || 0,
        revenue: item.stats?.totalAmount || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [allEventStats]);

  // Get top categories by votes across all events
  const allCategories = useMemo(() => {
    return allEventStats
      .flatMap((item) =>
        (item.stats?.categories || []).map((cat) => ({
          name: cat.name,
          eventName: item.event.name,
          votes: cat.voteCount,
          revenue: cat.amount,
        }))
      )
      .sort((a, b) => b.votes - a.votes);
  }, [allEventStats]);

  // Get top nominees by votes across all events
  const allNominees = useMemo(() => {
    return allEventStats
      .flatMap((item) =>
        (item.stats?.categories || []).flatMap((cat) =>
          (cat.nominees || []).map((nom) => ({
            name: nom.name,
            categoryName: cat.name,
            eventName: item.event.name,
            votes: nom.voteCount,
            revenue: nom.amount,
          }))
        )
      )
      .sort((a, b) => b.votes - a.votes);
  }, [allEventStats]);

  // Custom colors for charts
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
  ];

  // No data view
  if (allEventStats.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>

        <Card className="h-[400px] flex items-center justify-center">
          <CardContent className="text-center">
            <h2 className="text-xl font-medium text-gray-700 mb-4">
              No voting data available
            </h2>
            <p className="text-gray-500 mb-6">
              You need to create events, add nominees, and gather votes to see
              analytics.
            </p>
            <div className="space-x-4">
              <Link href="/admin/events/new">
                <Button>Create an Event</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Comprehensive voting insights across all events
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.votes}</div>
            <p className="text-xs text-gray-500 mt-1">
              Across {events.length} events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalStats.revenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Average{" "}
              {totalStats.votes > 0
                ? formatCurrency(totalStats.revenue / totalStats.votes)
                : formatCurrency(0)}{" "}
              per vote
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Award className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.categories}</div>
            <p className="text-xs text-gray-500 mt-1">
              With {totalStats.nominees} nominees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Votes/Category
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalStats.categories > 0
                ? Math.round(totalStats.votes / totalStats.categories)
                : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Engagement metric</p>
          </CardContent>
        </Card>
      </div>

      {/* View Selection Tabs */}
      <Tabs
        value={viewType}
        onValueChange={(v) => setViewType(v as any)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="nominees">Nominees</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top Events by Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Event</CardTitle>
              <CardDescription>
                Performance comparison across events
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={eventRevenueData.slice(0, 5)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "revenue")
                        return formatCurrency(value as number);
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="votes"
                    fill="#8884d8"
                    name="Votes"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    fill="#82ca9d"
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Categories & Nominees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>
                  Categories with the most votes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allCategories.slice(0, 5).map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{category.name}</span>
                          <p className="text-xs text-gray-500">
                            {category.eventName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{category.votes}</span>
                          <span className="text-gray-500 text-sm ml-1">
                            votes
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={(category.votes / allCategories[0].votes) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Nominees */}
            <Card>
              <CardHeader>
                <CardTitle>Top Nominees</CardTitle>
                <CardDescription>Nominees with the most votes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allNominees.slice(0, 5).map((nominee, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{nominee.name}</span>
                          <p className="text-xs text-gray-500">
                            {nominee.categoryName} • {nominee.eventName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{nominee.votes}</span>
                          <span className="text-gray-500 text-sm ml-1">
                            votes
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={(nominee.votes / allNominees[0].votes) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Performance Comparison</CardTitle>
              <CardDescription>
                Detailed breakdown of votes and revenue by event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={eventRevenueData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "revenue")
                          return formatCurrency(value as number);
                        return value;
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="votes"
                      fill="#8884d8"
                      name="Votes"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="revenue"
                      fill="#82ca9d"
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-4">
                  Revenue Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventRevenueData}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {eventRevenueData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="w-full">
                <h3 className="text-lg font-medium mb-4">Event Details</h3>
                <div className="space-y-6">
                  {eventRevenueData.map((event, index) => (
                    <div
                      key={index}
                      className="border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{event.name}</h4>
                        <Link
                          href={`/admin/events/${allEventStats[index].event._id}/results`}
                        >
                          <Button variant="ghost" size="sm" className="h-8">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-gray-500">Votes</p>
                          <p className="font-medium">{event.votes}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Revenue</p>
                          <p className="font-medium">
                            {formatCurrency(event.revenue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                Analysis of votes across all categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={allCategories.slice(0, 10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="#8884d8" name="Votes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-6 mt-8">
                <h3 className="text-lg font-medium">Categories Ranking</h3>
                <div className="space-y-4">
                  {allCategories.map((category, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{category.name}</span>
                          <p className="text-xs text-gray-500">
                            {category.eventName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{category.votes}</span>
                          <span className="text-gray-500 text-xs ml-1">
                            votes
                          </span>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(category.revenue)}
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={(category.votes / allCategories[0].votes) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nominees Tab */}
        <TabsContent value="nominees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Nominees</CardTitle>
              <CardDescription>
                Nominees with the highest votes across all events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={allNominees.slice(0, 10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="#8884d8" name="Votes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-6 mt-8">
                <h3 className="text-lg font-medium">Nominees Ranking</h3>
                <div className="space-y-4">
                  {allNominees.slice(0, 20).map((nominee, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{nominee.name}</span>
                          <p className="text-xs text-gray-500">
                            {nominee.categoryName} • {nominee.eventName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{nominee.votes}</span>
                          <span className="text-gray-500 text-xs ml-1">
                            votes
                          </span>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(nominee.revenue)}
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={(nominee.votes / allNominees[0].votes) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
