"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function USSDDashboard() {
  const transactions = useQuery(api.payments.getUSSDTransactions) || [];

  // Calculate total amount
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate total votes
  const totalVotes = transactions.reduce(
    (sum, t) => sum + (t.voteCount || 0),
    0
  );

  // Calculate success rate
  const successfulTransactions = transactions.filter(
    (t) => t.status === "succeeded"
  ).length;
  const successRate =
    transactions.length > 0
      ? (successfulTransactions / transactions.length) * 100
      : 0;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">USSD Transactions Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVotes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <div className="rounded-md border">
        <DataTable columns={columns} data={transactions} />
      </div>
    </div>
  );
}
