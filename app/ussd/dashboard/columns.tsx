"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Define the type for our transaction data
type Transaction = {
  transactionId: string;
  amount: number;
  voteCount: number;
  status: "pending" | "succeeded" | "failed";
  phoneNumber: string;
  source: "ussd" | "app";
  createdAt: number;
  nominee?: {
    name: string;
    code: string;
  } | null;
};

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
  },
  {
    accessorKey: "nominee",
    header: "Nominee",
    cell: ({ row }: { row: { original: Transaction } }) => {
      const nominee = row.original.nominee;
      return nominee ? `${nominee.name} (${nominee.code})` : "N/A";
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }: { row: { original: Transaction } }) => {
      const source = row.original.source;
      return (
        <Badge variant={source === "ussd" ? "default" : "secondary"}>
          {source.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }: { row: { original: Transaction } }) =>
      formatCurrency(row.original.amount),
  },
  {
    accessorKey: "voteCount",
    header: "Votes",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: Transaction } }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === "succeeded"
              ? "default"
              : status === "failed"
                ? "destructive"
                : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }: { row: { original: Transaction } }) => {
      return new Date(row.original.createdAt).toLocaleString();
    },
  },
];
