"use client";

import { useMemo } from "react";
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
  RefreshCcw,
  Trophy,
  ArrowRight,
  PlusCircle,
  Calendar,
  DollarSign,
  Vote,
  Activity,
  Users,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboard() {
  const { admin } = useAuthStore();

  // Get department info using slug instead of ID
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

  // Get all votes for these events
  const allVotes = useQuery(api.voting.getAllVotes) || [];

  // Get all payments for this department
  const allPayments =
    useQuery(
      api.voting.getPaymentsByDepartment,
      department ? { departmentId: department._id } : "skip"
    ) || [];

  // Calculate statistics using useMemo to ensure reactivity on data changes
  const stats = useMemo(() => {
    // Count active events
    const activeEventsCount = events.filter((event) => event.isActive).length;

    // Filter department-related votes
    const departmentVotes =
      events.length > 0
        ? allVotes.filter((vote) =>
            events.some((event) => event._id === vote.eventId)
          )
        : [];

    // Calculate total votes
    const totalVotes = departmentVotes.length;

    // Calculate total revenue from successful payments
    const successfulPayments = allPayments.filter(
      (p) => p.status === "succeeded"
    );
    const totalAmount = successfulPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    return {
      activeEventsCount,
      totalVotes,
      totalAmount,
    };
  }, [events, allVotes, allPayments]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Welcome back, {admin?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your events today
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Department Info */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/70"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Department Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:justify-between gap-6 pt-2">
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
              <p className="font-medium text-gray-800">
                {department?.name || "Loading..."}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Slug</h3>
              <p className="font-medium text-gray-800">
                {department?.slug || "Loading..."}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Admin</h3>
              <p className="font-medium text-gray-800">
                {admin?.name || "Loading..."}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Created
              </h3>
              <p className="font-medium text-gray-800">
                {department
                  ? new Date(department.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Loading..."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Events
                </p>
                <div className="flex items-baseline">
                  <h3 className="text-3xl font-bold text-gray-800">
                    {events?.length || 0}
                  </h3>
                  <span className="ml-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Managed
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/events"
                className="text-sm font-medium text-primary flex items-center hover:text-primary/80 transition-colors"
              >
                View all events
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Active Events
                </p>
                <div className="flex items-baseline">
                  <h3 className="text-3xl font-bold text-gray-800">
                    {stats.activeEventsCount}
                  </h3>
                  <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    Running
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-1"></span>{" "}
                Live updates
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Votes
                </p>
                <div className="flex items-baseline">
                  <h3 className="text-3xl font-bold text-gray-800">
                    {stats.totalVotes}
                  </h3>
                  {stats.totalVotes > 0 && (
                    <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      Counted
                    </span>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Vote className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/analytics"
                className="text-sm font-medium text-primary flex items-center hover:text-primary/80 transition-colors"
              >
                View analytics
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Revenue
                </p>
                <div className="flex items-baseline">
                  <h3 className="text-3xl font-bold text-gray-800">
                    {formatCurrency(stats.totalAmount)}
                  </h3>
                  {stats.totalAmount > 0 && (
                    <span className="ml-2 text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                      Earned
                    </span>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/payments"
                className="text-sm font-medium text-primary flex items-center hover:text-primary/80 transition-colors"
              >
                View payments
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Quick Access */}
        <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-green-500/5 z-0"></div>
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-primary/20 to-green-500/20 rounded-bl-full z-0"></div>
          <div className="relative z-10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 bg-amber-100 p-2 rounded-lg">
                    <Trophy className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">
                      Leaderboard
                    </CardTitle>
                    <CardDescription>
                      Track top performers in real-time
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                View detailed rankings, generate reports, and see who's
                currently leading the competition. The leaderboard updates in
                real-time as votes come in.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/admin/leaderboard">
                <Button
                  variant="outline"
                  className="rounded-lg border-primary/20 text-primary hover:text-primary/90 hover:bg-primary/5 transition-all duration-200"
                >
                  View Leaderboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </div>
        </Card>

        {/* Recent Events */}
        <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/70"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-gray-800">
                  Recent Events
                </CardTitle>
                <CardDescription>Your most recent events</CardDescription>
              </div>
              <div className="text-xs text-primary flex items-center font-medium bg-primary/10 px-2 py-1 rounded-full">
                <RefreshCcw className="h-3 w-3 mr-1 animate-spin-slow" />
                Live updating
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-lg">
                <Calendar className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">No events created yet</p>
                <Link href="/admin/events/new">
                  <Button className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          event.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {event.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {new Date(event.startDate).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}{" "}
                          -{" "}
                          {new Date(event.endDate).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.isActive ? "Active" : "Inactive"}
                      </div>
                      <Link href={`/admin/events/${event._id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}

                {events.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/admin/events">
                      <Button
                        variant="outline"
                        className="rounded-lg text-primary hover:text-primary/90 hover:bg-primary/5 border-primary/20 transition-all duration-200"
                      >
                        View All Events
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
