"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Search,
  Phone,
  User,
  Calendar,
  DollarSign,
  BarChart3,
  ArrowUpDown,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Define the type for our transaction data
type Transaction = {
  _id: string;
  transactionId: string;
  amount: number;
  voteCount?: number;
  status: "pending" | "succeeded" | "failed";
  phoneNumber?: string;
  nomineeId?: string;
  source?: "ussd" | "app";
  createdAt: number;
  paymentReference: string;
  nominee?: {
    name: string;
    code: string;
  } | null;
};

export default function USSDDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const ussdTransactions = useQuery(api.payments.getUSSDTransactions) as
    | Transaction[]
    | undefined;

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
  const filteredTransactions = useMemo(() => {
    if (!ussdTransactions) return [];

    return ussdTransactions.filter((transaction) => {
      // Apply search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        transaction.transactionId.toLowerCase().includes(searchLower) ||
        transaction.phoneNumber?.toLowerCase().includes(searchLower) ||
        transaction.paymentReference.toLowerCase().includes(searchLower) ||
        transaction.nominee?.code.toLowerCase().includes(searchLower);

      // Apply status filter
      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      // Apply date range filter
      const dateRangeTimestamp = getDateRangeTimestamp();
      const matchesDateRange =
        dateRangeFilter === "all" ||
        transaction.createdAt >= dateRangeTimestamp;

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [ussdTransactions, searchQuery, statusFilter, dateRangeFilter]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      return (a.createdAt - b.createdAt) * modifier;
    });
  }, [filteredTransactions, sortDirection]);

  // Calculate statistics
  const totalAmount = useMemo(
    () =>
      sortedTransactions
        .filter((t) => t.status === "succeeded")
        .reduce((sum, t) => sum + t.amount, 0),
    [sortedTransactions]
  );

  const totalTransactions = sortedTransactions.length;
  const successfulTransactions = useMemo(
    () => sortedTransactions.filter((t) => t.status === "succeeded").length,
    [sortedTransactions]
  );
  const pendingTransactions = useMemo(
    () => sortedTransactions.filter((t) => t.status === "pending").length,
    [sortedTransactions]
  );
  const failedTransactions = useMemo(
    () => sortedTransactions.filter((t) => t.status === "failed").length,
    [sortedTransactions]
  );

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            USSD Transactions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all USSD transactions
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Amount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-gray-500">Total revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Transactions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalTransactions}
            </div>
            <p className="text-xs text-gray-500">USSD transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Success Rate
            </CardTitle>
            <Phone className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalTransactions > 0
                ? ((successfulTransactions / totalTransactions) * 100).toFixed(
                    1
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-gray-500">Successful transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Status Breakdown
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">Succeeded</span>
                <span className="font-medium">{successfulTransactions}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-600">Pending</span>
                <span className="font-medium">{pendingTransactions}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600">Failed</span>
                <span className="font-medium">{failedTransactions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Transaction History
          </CardTitle>
          <CardDescription className="text-gray-500">
            View all transactions made through the USSD application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by phone number, transaction ID, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-gray-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-[180px] border-gray-200">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-600">
                    Transaction ID
                  </TableHead>
                  <TableHead className="text-gray-600">Phone Number</TableHead>
                  <TableHead className="text-gray-600">Nominee Code</TableHead>
                  <TableHead className="text-gray-600">Amount</TableHead>
                  <TableHead className="text-gray-600">Votes</TableHead>
                  <TableHead className="text-gray-600">Status</TableHead>
                  <TableHead className="text-gray-600">Reference</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2 text-gray-600">
                      Date
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={toggleSortDirection}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {transaction.transactionId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {transaction.phoneNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {transaction.nominee?.code || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {transaction.voteCount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`flex items-center gap-1 ${
                          transaction.status === "succeeded"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {transaction.paymentReference}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* No Results Message */}
          {sortedTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
