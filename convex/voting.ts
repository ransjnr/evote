import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Note: Email sending is now handled directly by the frontend after payment verification
// This ensures reliable delivery and works in both development and production

// Initialize a payment transaction
export const initializePayment = mutation({
  args: {
    nomineeId: v.id("nominees"),
    categoryId: v.id("categories"),
    eventId: v.id("events"),
    voteCount: v.optional(v.number()), // Make voteCount optional
    voterEmail: v.optional(v.string()), // Add voter email for notifications
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
    const totalAmount = (event.votePrice || 0) * voteCount;

    // Create pending payment in the database
    const paymentId = await ctx.db.insert("payments", {
      transactionId,
      amount: totalAmount,
      voteCount: voteCount,
      status: "pending",
      eventId: args.eventId,
      paymentReference: "",
      paymentType: "vote",
      nomineeId: args.nomineeId, // Store nominee reference
      createdAt: Date.now(),
    });

    // Return the payment info for processing
    return {
      success: true,
      payment: {
        id: paymentId,
        transactionId,
        amount: totalAmount,
        voteCount: voteCount,
        nomineeId: args.nomineeId,
        categoryId: args.categoryId,
        eventId: args.eventId,
        voterEmail: args.voterEmail,
      },
    };
  },
});

// Verify and record a payment
export const verifyPayment = action({
  args: {
    transactionId: v.string(),
    paymentReference: v.string(),
    nomineeId: v.id("nominees"),
    categoryId: v.id("categories"),
    eventId: v.id("events"),
    voteCount: v.optional(v.number()), // Make voteCount optional
    voterEmail: v.optional(v.string()), // Add voter email for notifications
  },
  handler: async (ctx, args) => {
    // Find the payment record
    const payment = await ctx.runQuery(
      internal.voting.getPaymentByTransaction,
      {
        transactionId: args.transactionId,
      }
    );

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
      ctx.runQuery(internal.voting.getNomineeById, { id: args.nomineeId }),
      ctx.runQuery(internal.voting.getCategoryById, { id: args.categoryId }),
      ctx.runQuery(internal.voting.getEventById, { id: args.eventId }),
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

    // Call mutation to process the payment
    const result = await ctx.runMutation(
      internal.voting.processPaymentMutation,
      {
        paymentId: payment._id,
        transactionId: args.transactionId,
        paymentReference: args.paymentReference,
        nomineeId: args.nomineeId,
        categoryId: args.categoryId,
        eventId: args.eventId,
        voteCount,
        voterEmail: args.voterEmail,
      }
    );

    // Send email notification if voter email is provided
    if (args.voterEmail) {
      console.log(
        "📧 Voter email found, sending notification:",
        args.voterEmail
      );

      const emailData = {
        voterEmail: args.voterEmail,
        nominee: {
          name: nominee.name,
          code: nominee.code,
        },
        event: {
          name: event.name,
        },
        voteCount,
        amount: payment.amount,
        transactionId: args.transactionId,
      };

      console.log(
        "📧 Email data prepared:",
        JSON.stringify(emailData, null, 2)
      );

      // Send email notification asynchronously (non-blocking)
      ctx.scheduler.runAfter(
        0,
        internal.voting.sendVoteNotificationEmail,
        emailData
      );
    } else {
      console.log(
        "⚠️ No voter email provided - email notification will be skipped"
      );
    }

    return {
      success: true,
      voteIds: result.voteIds,
      totalVotes: result.totalVotes,
      voteCount,
      emailSent: !!args.voterEmail,
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
    let allPayments: any[] = [];

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

// Initialize a payment using a nominee code (for USSD integration)
export const initializePaymentByCode = mutation({
  args: {
    nomineeCode: v.string(),
    voteCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Default to 1 vote if not specified
    const voteCount = args.voteCount ?? 1;

    // Validate vote count
    if (voteCount <= 0 || !Number.isInteger(voteCount)) {
      throw new ConvexError("Vote count must be a positive integer");
    }

    // Find the nominee by code
    const nominee = await ctx.db
      .query("nominees")
      .withIndex("by_code", (q) => q.eq("code", args.nomineeCode))
      .first();

    if (!nominee) {
      throw new ConvexError(`Nominee with code ${args.nomineeCode} not found`);
    }

    // Get the category
    const category = await ctx.db.get(nominee.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Get the event
    const event = await ctx.db.get(category.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Validate event is active
    if (!event.isActive) {
      throw new ConvexError("Event is not active");
    }

    const now = Date.now();
    if (now < event.startDate || now > event.endDate) {
      throw new ConvexError("Voting is not open for this event");
    }

    // Create a transaction ID (unique reference) that includes the vote count and code
    const transactionId = `vote_${args.nomineeCode}_${Date.now()}_vc${voteCount}_${Math.random().toString(36).substring(2, 5)}`;

    // Calculate total amount based on vote price and count
    const totalAmount = (event.votePrice || 0) * voteCount;

    // Create pending payment in the database
    const paymentId = await ctx.db.insert("payments", {
      transactionId,
      amount: totalAmount,
      voteCount: voteCount,
      status: "pending",
      eventId: event._id,
      paymentReference: "",
      paymentType: "vote",
      createdAt: Date.now(),
    });

    // Return the payment info with nominee details for confirmation
    return {
      success: true,
      payment: {
        transactionId,
        amount: totalAmount,
        voteCount: voteCount,
      },
      nominee: {
        id: nominee._id,
        name: nominee.name,
        code: nominee.code,
        categoryId: nominee.categoryId,
        eventId: event._id,
      },
    };
  },
});

// Verify and record a payment by code (for USSD integration)
export const verifyPaymentByCode = mutation({
  args: {
    transactionId: v.string(),
    paymentReference: v.string(),
    nomineeCode: v.string(),
    voteCount: v.optional(v.number()),
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

    // Find the nominee by code
    const nominee = await ctx.db
      .query("nominees")
      .withIndex("by_code", (q) => q.eq("code", args.nomineeCode))
      .first();

    if (!nominee) {
      throw new ConvexError(`Nominee with code ${args.nomineeCode} not found`);
    }

    // Get the category
    const category = await ctx.db.get(nominee.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Get the event (we already have the eventId from payment record)
    const event = await ctx.db.get(payment.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Verify the event is still active
    if (!event.isActive) {
      throw new ConvexError("Event is no longer active");
    }

    const now = Date.now();
    if (now < event.startDate || now > event.endDate) {
      throw new ConvexError("Voting is no longer open for this event");
    }

    // Update payment status to succeeded
    await ctx.db.patch(payment._id, {
      status: "succeeded",
      paymentReference: args.paymentReference,
      voteCount: voteCount,
    });

    // Record votes - one database entry per vote for accurate counting
    const voteIds = [];

    for (let i = 0; i < voteCount; i++) {
      const voteId = await ctx.db.insert("votes", {
        nomineeId: nominee._id,
        categoryId: category._id,
        eventId: event._id,
        transactionId: args.transactionId,
        amount: payment.amount / voteCount,
        createdAt: Date.now(),
      });

      voteIds.push(voteId);
    }

    // Get the total votes for this nominee
    const nomineeVotes = await ctx.db
      .query("votes")
      .withIndex("by_nominee", (q) => q.eq("nomineeId", nominee._id))
      .collect();

    const totalVotes = nomineeVotes.length;

    return {
      success: true,
      voteIds,
      totalVotes,
      voteCount,
      nominee: {
        id: nominee._id,
        name: nominee.name,
        code: nominee.code,
      },
    };
  },
});

// Get nominee information by code (for USSD integration)
export const getNomineeByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the nominee by code
    const nominee = await ctx.db
      .query("nominees")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!nominee) {
      throw new ConvexError(`Nominee with code ${args.code} not found`);
    }

    // Get the category to get the event info
    const category = await ctx.db.get(nominee.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Get the event
    const event = await ctx.db.get(category.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Get the department
    const department = await ctx.db.get(event.departmentId);

    // Get vote count for this nominee
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_nominee", (q) => q.eq("nomineeId", nominee._id))
      .collect();

    return {
      nominee: {
        id: nominee._id,
        name: nominee.name,
        code: nominee.code,
        description: nominee.description,
        voteCount: votes.length,
      },
      category: {
        id: category._id,
        name: category.name,
        type: category.type,
      },
      event: {
        id: event._id,
        name: event.name,
        votePrice: event.votePrice,
        isActive: event.isActive,
        startDate: event.startDate,
        endDate: event.endDate,
      },
      department: department
        ? {
            id: department._id,
            name: department.name,
            slug: department.slug,
          }
        : null,
    };
  },
});
