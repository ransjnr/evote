"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpDown,
  Download,
} from "lucide-react";

export default function AdminPayments() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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

  // Extract event IDs
  const eventIds = useMemo(() => events.map((event) => event._id), [events]);

  // Get all payments for the department directly
  const departmentPayments =
    useQuery(
      api.payments.getPaymentsByDepartment,
      department ? { departmentId: department._id } : "skip"
    ) || [];

  // Combine payments with event information
  const allPayments = useMemo(() => {
    return departmentPayments.map((payment) => {
      const event = events.find((e) => e._id === payment.eventId);
      return {
        ...payment,
        eventName: event?.name || payment.eventName || "Unknown Event",
        eventId: payment.eventId,
      };
    });
  }, [departmentPayments, events]);

  // Calculate date range for filtering
  const getDateRangeTimestamp = () => {
    const now = new Date();
    switch (dateRangeFilter) {
      case "today":
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        return today.getTime();
      case "week":
        const week = new Date(now);
        week.setDate(now.getDate() - 7);
        return week.getTime();
      case "month":
        const month = new Date(now);
        month.setMonth(now.getMonth() - 1);
        return month.getTime();
      default:
        return 0;
    }
  };

  // Apply filters
  const filteredPayments = useMemo(() => {
    return allPayments.filter((payment) => {
      // Apply search filter
      const matchesSearch =
        payment.transactionId
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        payment.paymentReference
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (payment.ticketTypeName &&
          payment.ticketTypeName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (payment.nomineeName &&
          payment.nomineeName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      // Apply status filter
      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      // Apply event filter
      const matchesEvent =
        eventFilter === "all" || payment.eventId === eventFilter;

      // Apply payment type filter
      const matchesPaymentType =
        paymentTypeFilter === "all" ||
        payment.paymentType === paymentTypeFilter;

      // Apply date range filter
      const dateRangeTimestamp = getDateRangeTimestamp();
      const matchesDateRange =
        dateRangeFilter === "all" || payment.createdAt >= dateRangeTimestamp;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesEvent &&
        matchesPaymentType &&
        matchesDateRange
      );
    });
  }, [
    allPayments,
    searchQuery,
    statusFilter,
    eventFilter,
    paymentTypeFilter,
    dateRangeFilter,
  ]);

  // Sort payments
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      return (a.createdAt - b.createdAt) * modifier;
    });
  }, [filteredPayments, sortDirection]);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  });

  const formatCurrency = (amount: number) => {
    return formatter.format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate totals and statistics
  const totalAmount = useMemo(
    () =>
      sortedPayments
        .filter((p) => p.status === "succeeded")
        .reduce((sum, payment) => sum + payment.amount, 0),
    [sortedPayments]
  );

  const votePayments = useMemo(
    () => sortedPayments.filter((p) => p.paymentType === "vote"),
    [sortedPayments]
  );

  const ticketPayments = useMemo(
    () => sortedPayments.filter((p) => p.paymentType === "ticket"),
    [sortedPayments]
  );

  const voteRevenue = useMemo(
    () =>
      votePayments
        .filter((p) => p.status === "succeeded")
        .reduce((sum, payment) => sum + payment.amount, 0),
    [votePayments]
  );

  const ticketRevenue = useMemo(
    () =>
      ticketPayments
        .filter((p) => p.status === "succeeded")
        .reduce((sum, payment) => sum + payment.amount, 0),
    [ticketPayments]
  );

  const totalTransactions = sortedPayments.length;
  const successfulTransactions = useMemo(
    () => sortedPayments.filter((p) => p.status === "succeeded").length,
    [sortedPayments]
  );
  const pendingTransactions = useMemo(
    () => sortedPayments.filter((p) => p.status === "pending").length,
    [sortedPayments]
  );
  const failedTransactions = useMemo(
    () => sortedPayments.filter((p) => p.status === "failed").length,
    [sortedPayments]
  );

  // Calculate payment statistics by event
  const eventStats = useMemo(
    () =>
      events
        .map((event) => {
          const eventPayments = allPayments.filter(
            (p) => p.eventId === event._id
          );
          const successful = eventPayments.filter(
            (p) => p.status === "succeeded"
          );
          const totalAmount = successful.reduce((sum, p) => sum + p.amount, 0);

          return {
            eventId: event._id,
            eventName: event.name,
            totalTransactions: eventPayments.length,
            successfulTransactions: successful.length,
            totalAmount,
          };
        })
        .sort((a, b) => b.totalAmount - a.totalAmount),
    [events, allPayments]
  );

  // Get the most recent payment date for data freshness indicator
  const mostRecentPayment = useMemo(
    () =>
      allPayments.length > 0
        ? Math.max(...allPayments.map((p) => p.createdAt))
        : null,
    [allPayments]
  );

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Transactions</h1>
          {mostRecentPayment && (
            <p className="text-sm text-gray-500 mt-1">
              Last transaction: {formatDate(mostRecentPayment)}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-sm text-green-600 mt-1">
              From {successfulTransactions} successful transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Vote Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {formatCurrency(voteRevenue)}
            </div>
            <p className="text-sm text-blue-600 mt-1">
              {votePayments.filter((p) => p.status === "succeeded").length} vote
              payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Ticket Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {formatCurrency(ticketRevenue)}
            </div>
            <p className="text-sm text-purple-600 mt-1">
              {ticketPayments.filter((p) => p.status === "succeeded").length}{" "}
              ticket sales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyan-600 flex items-center">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-700">
              {totalTransactions}
            </div>
            <div className="flex justify-between text-sm text-cyan-600 mt-1">
              <span>All payment attempts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">
              {pendingTransactions}
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              {totalTransactions > 0
                ? `${Math.round((pendingTransactions / totalTransactions) * 100)}% of all transactions`
                : "No transactions"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              {failedTransactions}
            </div>
            <p className="text-sm text-red-600 mt-1">
              {totalTransactions > 0
                ? `${Math.round((failedTransactions / totalTransactions) * 100)}% of all transactions`
                : "No transactions"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Revenue Distribution */}
      {eventStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Event</CardTitle>
            <CardDescription>
              Distribution of payment revenue across events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventStats.map((stat) => (
                <div key={stat.eventId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{stat.eventName}</span>
                    <div className="text-right">
                      <span className="font-medium">
                        {formatCurrency(stat.totalAmount)}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        ({stat.successfulTransactions} payments)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress
                      value={
                        totalAmount > 0
                          ? (stat.totalAmount / totalAmount) * 100
                          : 0
                      }
                      className="h-2"
                    />
                    <div className="w-16 text-right">
                      <span className="text-xs font-medium">
                        {totalAmount > 0
                          ? `${Math.round((stat.totalAmount / totalAmount) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            View and filter all payment transactions
          </CardDescription>
          <div className="flex flex-col md:flex-row flex-wrap gap-4 mt-4">
            <Input
              placeholder="Search by transaction ID or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-full md:w-[180px]"
                aria-label="Filter by status"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger
                className="w-full md:w-[200px]"
                aria-label="Filter by event"
              >
                <SelectValue placeholder="Event" />
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
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger
                className="w-full md:w-[180px]"
                aria-label="Filter by date range"
              >
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={paymentTypeFilter}
              onValueChange={setPaymentTypeFilter}
            >
              <SelectTrigger
                className="w-full md:w-[180px]"
                aria-label="Filter by payment type"
              >
                <SelectValue placeholder="Payment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vote">Voting</SelectItem>
                <SelectItem value="ticket">Tickets</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={toggleSortDirection}
              className="flex items-center"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Date: {sortDirection === "desc" ? "Newest First" : "Oldest First"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <div className="text-center py-10">
              {searchQuery ||
              statusFilter !== "all" ||
              eventFilter !== "all" ||
              dateRangeFilter !== "all" ? (
                <p className="text-gray-500">No payments match your filters</p>
              ) : (
                <p className="text-gray-500">No payment transactions yet</p>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPayments.map((payment) => (
                    <TableRow
                      key={payment._id}
                      className={payment.status === "failed" ? "bg-red-50" : ""}
                    >
                      <TableCell className="font-medium truncate max-w-[150px]">
                        {payment.transactionId}
                      </TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>{payment.eventName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.paymentType === "vote"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {payment.paymentType === "vote"
                            ? "Voting"
                            : "Tickets"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {payment.paymentType === "vote" ? (
                          <div className="text-sm">
                            {payment.nomineeName && (
                              <div className="font-medium">
                                {payment.nomineeName}
                              </div>
                            )}
                            {payment.nomineeCode && (
                              <div className="text-gray-500">
                                Code: {payment.nomineeCode}
                              </div>
                            )}
                            {payment.voteCount && (
                              <div className="text-gray-500">
                                {payment.voteCount} votes
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm">
                            {payment.ticketTypeName && (
                              <div className="font-medium">
                                {payment.ticketTypeName}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">
                        {payment.paymentReference || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t py-4 flex justify-between">
          <div className="text-sm text-gray-500">
            Showing {sortedPayments.length} of {allPayments.length} transactions
          </div>
          <div className="text-sm font-medium">
            Filtered Total:{" "}
            {formatCurrency(
              sortedPayments
                .filter((p) => p.status === "succeeded")
                .reduce((sum, p) => sum + p.amount, 0)
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
