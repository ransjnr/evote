import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Initialize a payment transaction
export const initializePayment = mutation({
  args: {
    nomineeId: v.id("nominees"),
    categoryId: v.id("categories"),
    eventId: v.id("events"),
    voteCount: v.optional(v.number()), // Make voteCount optional
  },
  handler: async (ctx, args) => {
    // Default to 1 vote if not specified
    const voteCount = args.voteCount ?? 1;

    // Validate vote count
    if (voteCount <= 0 || !Number.isInteger(voteCount)) {
      throw new ConvexError("Vote count must be a positive integer");
    }

    // Validate nominee exists
    const nominee = await ctx.db.get(args.nomineeId);
    if (!nominee) {
      throw new ConvexError("Nominee not found");
    }

    // Validate category exists
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Validate event exists and is active
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    if (!event.isActive) {
      throw new ConvexError("Event is not active");
    }

    const now = Date.now();
    if (now < event.startDate || now > event.endDate) {
      throw new ConvexError("Voting is not open for this event");
    }

    // Create a transaction ID (unique reference) that includes the vote count
    const transactionId = `vote_${Date.now()}_vc${voteCount}_${Math.random().toString(36).substring(2, 10)}`;

    // Calculate total amount based on vote price and count
    const totalAmount = event.votePrice * voteCount;

    // Create pending payment in the database
    const paymentId = await ctx.db.insert("payments", {
      transactionId,
      amount: totalAmount,
      voteCount: voteCount, // Store vote count explicitly
      status: "pending",
      eventId: args.eventId,
      paymentReference: "",
      createdAt: Date.now(),
    });

    return {
      success: true,
      payment: {
        transactionId,
        amount: totalAmount,
        voteCount: voteCount,
      },
    };
  },
});

// Verify and record a payment
export const verifyPayment = mutation({
  args: {
    transactionId: v.string(),
    paymentReference: v.string(),
    nomineeId: v.id("nominees"),
    categoryId: v.id("categories"),
    eventId: v.id("events"),
    voteCount: v.optional(v.number()), // Make voteCount optional
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

    if (payment.status === "succeeded") {
      throw new ConvexError("Payment already processed");
    }

    // Extract vote count - prefer the stored value in the payment record,
    // fallback to the argument, and finally use default of 1
    const voteCount = payment.voteCount ?? args.voteCount ?? 1;

    // Validate vote count
    if (voteCount <= 0 || !Number.isInteger(voteCount)) {
      throw new ConvexError("Vote count must be a positive integer");
    }

    // Verify the nominee, category and event still exist
    const [nominee, category, event] = await Promise.all([
      ctx.db.get(args.nomineeId),
      ctx.db.get(args.categoryId),
      ctx.db.get(args.eventId),
    ]);

    if (!nominee) throw new ConvexError("Nominee not found");
    if (!category) throw new ConvexError("Category not found");
    if (!event) throw new ConvexError("Event not found");

    // Verify the event is still active
    if (!event.isActive) {
      throw new ConvexError("Event is no longer active");
    }

    const now = Date.now();
    if (now < event.startDate || now > event.endDate) {
      throw new ConvexError("Voting is no longer open for this event");
    }

    // In a real-world scenario, we'd verify the payment with Paystack's API
    // This would involve a server-side call to Paystack's verify endpoint
    // For example:
    // const paystackVerification = await verifyWithPaystackAPI(args.paymentReference);
    // if (!paystackVerification.success) throw new ConvexError("Payment verification failed");

    // Update payment status to succeeded
    await ctx.db.patch(payment._id, {
      status: "succeeded",
      paymentReference: args.paymentReference,
      voteCount: voteCount, // Ensure vote count is recorded explicitly
    });

    // Record votes - one database entry per vote for accurate counting
    const voteIds = [];

    for (let i = 0; i < voteCount; i++) {
      const voteId = await ctx.db.insert("votes", {
        nomineeId: args.nomineeId,
        categoryId: args.categoryId,
        eventId: args.eventId,
        transactionId: args.transactionId,
        amount: payment.amount / voteCount, // Divide the total amount by vote count for per-vote amount
        createdAt: Date.now(),
      });

      voteIds.push(voteId);
    }

    // Get the total votes for this nominee
    const nomineeVotes = await ctx.db
      .query("votes")
      .withIndex("by_nominee", (q) => q.eq("nomineeId", args.nomineeId))
      .collect();

    const totalVotes = nomineeVotes.length;

    return {
      success: true,
      voteIds,
      totalVotes,
      voteCount,
    };
  },
});

// Get votes for a nominee
export const getNomineeVotes = query({
  args: {
    nomineeId: v.id("nominees"),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_nominee", (q) => q.eq("nomineeId", args.nomineeId))
      .collect();

    return votes.length;
  },
});

// Get votes for a category
export const getCategoryVotes = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    // Group votes by nominee
    const votesByNominee = votes.reduce(
      (acc, vote) => {
        acc[vote.nomineeId] = (acc[vote.nomineeId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return votesByNominee;
  },
});

// Get votes for an event
export const getEventVotes = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return votes.length;
  },
});

// Get vote stats by event
export const getEventVoteStats = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const totalVotes = votes.length;
    const totalAmount = votes.reduce((sum, vote) => sum + vote.amount, 0);

    // Get categories in this event
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Build results by category
    const categoryStats = [];

    for (const category of categories) {
      const categoryVotes = votes.filter(
        (vote) => vote.categoryId === category._id
      );

      // Get nominees in this category
      const nominees = await ctx.db
        .query("nominees")
        .withIndex("by_category", (q) => q.eq("categoryId", category._id))
        .collect();

      const nomineeStats = [];

      for (const nominee of nominees) {
        const nomineeVotes = categoryVotes.filter(
          (vote) => vote.nomineeId === nominee._id
        );

        nomineeStats.push({
          nomineeId: nominee._id,
          name: nominee.name,
          voteCount: nomineeVotes.length,
          amount: nomineeVotes.reduce((sum, vote) => sum + vote.amount, 0),
        });
      }

      // Sort nominees by vote count (descending)
      nomineeStats.sort((a, b) => b.voteCount - a.voteCount);

      categoryStats.push({
        categoryId: category._id,
        name: category.name,
        voteCount: categoryVotes.length,
        amount: categoryVotes.reduce((sum, vote) => sum + vote.amount, 0),
        nominees: nomineeStats,
      });
    }

    return {
      totalVotes,
      totalAmount,
      categories: categoryStats,
    };
  },
});

// Get payment records by event
export const getPaymentsByEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return payments;
  },
});

// Get all votes in the system
export const getAllVotes = query({
  args: {},
  handler: async (ctx) => {
    const votes = await ctx.db.query("votes").collect();
    return votes;
  },
});

// Get all payments for a department
export const getPaymentsByDepartment = query({
  args: {
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    // Get all events for this department
    const events = await ctx.db
      .query("events")
      .withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId)
      )
      .collect();

    // If there are no events, return an empty array
    if (events.length === 0) {
      return [];
    }

    // Get the event IDs
    const eventIds = events.map((event) => event._id);

    // Initialize an array to store all payments
    let allPayments = [];

    // For each event, get its payments and add them to the array
    for (const eventId of eventIds) {
      const payments = await ctx.db
        .query("payments")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();

      allPayments = [...allPayments, ...payments];
    }

    return allPayments;
  },
});
