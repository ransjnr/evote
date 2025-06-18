import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get all USSD transactions with nominee details
export const getUSSDTransactions = query({
  args: {},
  handler: async (ctx) => {
    // Get all payments that have a phone number (USSD transactions)
    const transactions = await ctx.db
      .query("payments")
      .filter((q) => q.neq(q.field("phoneNumber"), undefined))
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

// Get all payments for a department with event and ticket details
export const getPaymentsByDepartment = query({
  args: {
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    // Get all events for this department
    const events = await ctx.db
      .query("events")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .collect();

    const eventIds = events.map(e => e._id);

    if (eventIds.length === 0) {
      return [];
    }

    // Get all payments for these events
    const payments = await ctx.db
      .query("payments")
      .filter((q) => 
        q.or(
          ...eventIds.map(eventId => q.eq(q.field("eventId"), eventId))
        )
      )
      .collect();

    // Enhance payments with event and ticket type details
    const enhancedPayments = await Promise.all(
      payments.map(async (payment) => {
        const event = events.find(e => e._id === payment.eventId);
        
        let ticketType = null;
        let nominee = null;

        if (payment.ticketTypeId) {
          ticketType = await ctx.db.get(payment.ticketTypeId);
        }

        if (payment.nomineeId) {
          nominee = await ctx.db.get(payment.nomineeId);
        }

        return {
          ...payment,
          eventName: event?.name || "Unknown Event",
          ticketTypeName: ticketType?.name || null,
          nomineeName: nominee?.name || null,
          nomineeCode: nominee?.code || null,
        };
      })
    );

    // Sort by creation date (newest first)
    return enhancedPayments.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get all ticket payments with details
export const getTicketPayments = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("paymentType"), "ticket"))
      .collect();

    // Enhance with event and ticket type details
    const enhancedPayments = await Promise.all(
      payments.map(async (payment) => {
        const event = await ctx.db.get(payment.eventId);
        let ticketType = null;

        if (payment.ticketTypeId) {
          ticketType = await ctx.db.get(payment.ticketTypeId);
        }

        return {
          ...payment,
          eventName: event?.name || "Unknown Event",
          ticketTypeName: ticketType?.name || null,
        };
      })
    );

    return enhancedPayments.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get payment statistics for an event
export const getEventPaymentStats = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const votePayments = payments.filter(p => p.paymentType === "vote");
    const ticketPayments = payments.filter(p => p.paymentType === "ticket");

    const successfulVotePayments = votePayments.filter(p => p.status === "succeeded");
    const successfulTicketPayments = ticketPayments.filter(p => p.status === "succeeded");

    const voteRevenue = successfulVotePayments.reduce((sum, p) => sum + p.amount, 0);
    const ticketRevenue = successfulTicketPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPayments: payments.length,
      votePayments: {
        total: votePayments.length,
        successful: successfulVotePayments.length,
        revenue: voteRevenue,
      },
      ticketPayments: {
        total: ticketPayments.length,
        successful: successfulTicketPayments.length,
        revenue: ticketRevenue,
      },
      totalRevenue: voteRevenue + ticketRevenue,
    };
  },
});

// Create a payment record
export const createPayment = mutation({
  args: {
    transactionId: v.string(),
    amount: v.number(),
    eventId: v.id("events"),
    paymentType: v.union(v.literal("vote"), v.literal("ticket")),
    paymentReference: v.string(),
    ticketTypeId: v.optional(v.id("ticketTypes")),
    nomineeId: v.optional(v.id("nominees")),
    phoneNumber: v.optional(v.string()),
    voteCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });

    return { success: true, paymentId };
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    transactionId: v.string(),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed")),
    paymentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_transaction", (q) => q.eq("transactionId", args.transactionId))
      .first();

    if (!payment) {
      throw new ConvexError("Payment not found");
    }

    await ctx.db.patch(payment._id, {
      status: args.status,
      ...(args.paymentReference && { paymentReference: args.paymentReference }),
    });

    return { success: true };
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
      .withIndex("by_transaction", (q) => q.eq("transactionId", args.transactionId))
      .first();

    if (!payment) {
      return null;
    }

    // Get event details
    const event = await ctx.db.get(payment.eventId);
    
    let ticketType = null;
    if (payment.ticketTypeId) {
      ticketType = await ctx.db.get(payment.ticketTypeId);
    }

    let nominee = null;
    if (payment.nomineeId) {
      nominee = await ctx.db.get(payment.nomineeId);
    }

    return {
      ...payment,
      event,
      ticketType,
      nominee,
    };
  },
}); 