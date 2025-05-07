import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get all USSD transactions with nominee details
export const getUSSDTransactions = query({
  args: {},
  handler: async (ctx) => {
    // Get all payments with source "ussd"
    const transactions = await ctx.db
      .query("payments")
      .withIndex("by_source", (q) => q.eq("source", "ussd"))
      .collect();

    // Get nominee details for each transaction
    const transactionsWithNominees = await Promise.all(
      transactions.map(async (transaction) => {
        if (!transaction.nomineeId) return transaction;

        const nominee = await ctx.db.get(transaction.nomineeId);
        return {
          ...transaction,
          nominee: nominee
            ? {
                name: nominee.name,
                code: nominee.code,
              }
            : null,
        };
      })
    );

    // Sort by creation date (newest first)
    return transactionsWithNominees.sort(
      (a, b) => b.createdAt - a.createdAt
    );
  },
});

// Get all app transactions
export const getAppTransactions = query({
  args: {},
  handler: async (ctx) => {
    // Get all payments with source "app" or without phone number (for backward compatibility)
    const transactions = await ctx.db
      .query("payments")
      .filter((q) => 
        q.or(
          q.eq(q.field("source"), "app"),
          q.eq(q.field("phoneNumber"), undefined)
        )
      )
      .collect();

    // Get nominee details for each transaction
    const transactionsWithNominees = await Promise.all(
      transactions.map(async (transaction) => {
        if (!transaction.nomineeId) return transaction;

        const nominee = await ctx.db.get(transaction.nomineeId);
        return {
          ...transaction,
          nominee: nominee
            ? {
                name: nominee.name,
                code: nominee.code,
              }
            : null,
        };
      })
    );

    // Sort by creation date (newest first)
    return transactionsWithNominees.sort(
      (a, b) => b.createdAt - a.createdAt
    );
  },
});

// Update payment details with USSD-specific information
export const updatePaymentDetails = mutation({
  args: {
    transactionId: v.string(),
    phoneNumber: v.optional(v.string()),
    nomineeId: v.optional(v.id("nominees")),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed")
    ),
    source: v.union(v.literal("ussd"), v.literal("app")),
  },
  handler: async (ctx, args) => {
    // Find the payment record
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId)
      )
      .first();

    if (!payment) {
      throw new ConvexError("Payment not found");
    }

    // Update the payment record with USSD details
    await ctx.db.patch(payment._id, {
      phoneNumber: args.phoneNumber,
      nomineeId: args.nomineeId,
      status: args.status,
      source: args.source,
    });

    return { success: true };
  },
});

// Create a new payment record
export const createPayment = mutation({
  args: {
    transactionId: v.string(),
    amount: v.number(),
    voteCount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed")
    ),
    eventId: v.id("events"),
    paymentReference: v.string(),
    phoneNumber: v.string(),
    source: v.union(v.literal("ussd"), v.literal("app")),
  },
  handler: async (ctx, args) => {
    // Create the payment record
    const paymentId = await ctx.db.insert("payments", {
      transactionId: args.transactionId,
      amount: args.amount,
      voteCount: args.voteCount,
      status: args.status,
      eventId: args.eventId,
      paymentReference: args.paymentReference,
      phoneNumber: args.phoneNumber,
      source: args.source,
      createdAt: Date.now(),
    });

    return { success: true, paymentId };
  },
});

// Get payment by transaction ID
export const getPaymentByTransaction = query({
  args: {
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId)
      )
      .first();

    return payment;
  },
}); 