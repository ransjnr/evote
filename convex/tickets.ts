import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Helper function to generate 16-digit ticket code
const generateTicketCode = () => {
  // Generate a 16-digit numeric code
  let code = "";
  for (let i = 0; i < 16; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
};

// Create a new ticket type for an event
export const createTicketType = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    eventId: v.id("events"),
    price: v.number(),
    quantity: v.number(),
    benefits: v.optional(v.array(v.string())),
    adminId: v.id("admins"),
    saleStartDate: v.optional(v.number()),
    saleEndDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate price
    if (args.price <= 0) {
      throw new ConvexError("Ticket price must be greater than 0");
    }

    // Validate quantity
    if (args.quantity <= 0) {
      throw new ConvexError("Ticket quantity must be greater than 0");
    }

    // Validate dates if provided
    if (args.saleStartDate && args.saleEndDate) {
      if (args.saleStartDate >= args.saleEndDate) {
        throw new ConvexError("Sale end date must be after sale start date");
      }
    }

    // Get the event to verify it exists and check type
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    if (event.eventType === "voting_only") {
      throw new ConvexError("Cannot create tickets for voting-only events");
    }

    // Insert the new ticket type
    const ticketTypeId = await ctx.db.insert("ticketTypes", {
      name: args.name,
      description: args.description,
      eventId: args.eventId,
      price: args.price,
      quantity: args.quantity,
      remaining: args.quantity, // Initially, remaining = total quantity
      benefits: args.benefits,
      createdBy: args.adminId,
      createdAt: Date.now(),
      saleStartDate: args.saleStartDate,
      saleEndDate: args.saleEndDate,
    });

    return { success: true, ticketTypeId };
  },
});

// Update a ticket type
export const updateTicketType = mutation({
  args: {
    ticketTypeId: v.id("ticketTypes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    quantity: v.optional(v.number()),
    benefits: v.optional(v.array(v.string())),
    saleStartDate: v.optional(v.number()),
    saleEndDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ticketType = await ctx.db.get(args.ticketTypeId);
    if (!ticketType) {
      throw new ConvexError("Ticket type not found");
    }

    // Validate price if provided
    if (args.price !== undefined && args.price <= 0) {
      throw new ConvexError("Ticket price must be greater than 0");
    }

    // Validate quantity if provided
    if (args.quantity !== undefined) {
      if (args.quantity <= 0) {
        throw new ConvexError("Ticket quantity must be greater than 0");
      }

      // Calculate new remaining tickets
      const soldTickets = ticketType.quantity - ticketType.remaining;
      if (args.quantity < soldTickets) {
        throw new ConvexError(
          "Cannot reduce quantity below number of sold tickets"
        );
      }

      // Update remaining tickets based on new quantity
      const newRemaining = args.quantity - soldTickets;
      await ctx.db.patch(args.ticketTypeId, { remaining: newRemaining });
    }

    // Validate dates if both are provided
    if (args.saleStartDate && args.saleEndDate) {
      if (args.saleStartDate >= args.saleEndDate) {
        throw new ConvexError("Sale end date must be after sale start date");
      }
    }

    // Update the ticket type
    await ctx.db.patch(args.ticketTypeId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.price !== undefined && { price: args.price }),
      ...(args.quantity !== undefined && { quantity: args.quantity }),
      ...(args.benefits !== undefined && { benefits: args.benefits }),
      ...(args.saleStartDate !== undefined && {
        saleStartDate: args.saleStartDate,
      }),
      ...(args.saleEndDate !== undefined && { saleEndDate: args.saleEndDate }),
    });

    return { success: true };
  },
});

// Delete a ticket type
export const deleteTicketType = mutation({
  args: {
    ticketTypeId: v.id("ticketTypes"),
  },
  handler: async (ctx, args) => {
    const ticketType = await ctx.db.get(args.ticketTypeId);
    if (!ticketType) {
      throw new ConvexError("Ticket type not found");
    }

    // Check if there are any sold tickets
    const soldTickets = await ctx.db
      .query("tickets")
      .withIndex("by_ticket_type", (q) =>
        q.eq("ticketTypeId", args.ticketTypeId)
      )
      .collect();

    if (soldTickets.length > 0) {
      throw new ConvexError("Cannot delete ticket type with sold tickets");
    }

    // Delete the ticket type
    await ctx.db.delete(args.ticketTypeId);

    return { success: true };
  },
});

// Purchase tickets
export const purchaseTickets = mutation({
  args: {
    ticketTypeId: v.id("ticketTypes"),
    eventId: v.id("events"),
    quantity: v.number(),
    purchaserName: v.string(),
    purchaserEmail: v.string(),
    purchaserPhone: v.string(),
    transactionId: v.string(),
    additionalDetails: v.optional(
      v.object({
        age: v.optional(v.number()),
        gender: v.optional(v.string()),
        specialRequirements: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Validate quantity
    if (args.quantity <= 0) {
      throw new ConvexError("Quantity must be greater than 0");
    }

    // Get ticket type
    const ticketType = await ctx.db.get(args.ticketTypeId);
    if (!ticketType) {
      throw new ConvexError("Ticket type not found");
    }

    // Check if tickets are available
    if (ticketType.remaining < args.quantity) {
      throw new ConvexError("Not enough tickets available");
    }

    // Check if ticket sales are within valid dates
    const now = Date.now();
    if (ticketType.saleStartDate && now < ticketType.saleStartDate) {
      throw new ConvexError("Ticket sales have not started yet");
    }
    if (ticketType.saleEndDate && now > ticketType.saleEndDate) {
      throw new ConvexError("Ticket sales have ended");
    }

    // Calculate total amount
    const totalAmount = ticketType.price * args.quantity;

    // Create tickets with PENDING status - do NOT reduce remaining count yet
    const ticketPromises = Array.from({ length: args.quantity }).map(
      async () => {
        const ticketCode = generateTicketCode();
        return ctx.db.insert("tickets", {
          ticketTypeId: args.ticketTypeId,
          eventId: args.eventId,
          purchaserName: args.purchaserName,
          purchaserEmail: args.purchaserEmail,
          purchaserPhone: args.purchaserPhone,
          transactionId: args.transactionId,
          amount: ticketType.price,
          status: "pending",
          ticketCode,
          createdAt: Date.now(),
          additionalDetails: args.additionalDetails,
        });
      }
    );

    const ticketIds = await Promise.all(ticketPromises);

    // DO NOT update remaining tickets here - wait for payment confirmation
    // This prevents overselling when users abandon payments

    // Create payment record
    await ctx.db.insert("payments", {
      transactionId: args.transactionId,
      amount: totalAmount,
      status: "pending",
      eventId: args.eventId,
      paymentReference: args.transactionId,
      paymentType: "ticket",
      ticketTypeId: args.ticketTypeId,
      createdAt: Date.now(),
    });

    return { success: true, ticketIds };
  },
});

// Confirm ticket payment
export const confirmTicketPayment = mutation({
  args: {
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get payment details
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId)
      )
      .first();

    if (!payment) {
      throw new ConvexError("Payment not found");
    }

    if (payment.status !== "pending") {
      throw new ConvexError("Payment already processed");
    }

    // Get tickets for this transaction
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId)
      )
      .collect();

    if (tickets.length === 0) {
      throw new ConvexError("No tickets found for this transaction");
    }

    // Get ticket type to update remaining count
    const ticketType = await ctx.db.get(tickets[0].ticketTypeId);
    if (!ticketType) {
      throw new ConvexError("Ticket type not found");
    }

    // Double-check availability before confirming (prevent race conditions)
    if (ticketType.remaining < tickets.length) {
      throw new ConvexError(
        "Not enough tickets available to complete this purchase"
      );
    }

    // Update payment status to succeeded
    await ctx.db.patch(payment._id, {
      status: "succeeded",
    });

    // Update ticket statuses to confirmed
    for (const ticket of tickets) {
      await ctx.db.patch(ticket._id, {
        status: "confirmed",
      });
    }

    // NOW reduce the remaining ticket count (only after successful payment)
    await ctx.db.patch(tickets[0].ticketTypeId, {
      remaining: ticketType.remaining - tickets.length,
    });

    // Get event details for email
    const event = await ctx.db.get(payment.eventId);

    if (event && tickets.length > 0) {
      // Send confirmation email
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/tickets/send-confirmation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tickets,
              event,
              purchaserEmail: tickets[0].purchaserEmail,
              transactionId: args.transactionId,
            }),
          }
        );

        if (!response.ok) {
          console.error("Failed to send confirmation email");
        }
      } catch (error) {
        console.error("Error sending confirmation email:", error);
        // Don't throw error - payment is already successful
      }
    }

    return { success: true };
  },
});

// Validate ticket
export const validateTicket = mutation({
  args: {
    ticketCode: v.string(),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_ticket_code", (q) => q.eq("ticketCode", args.ticketCode))
      .first();

    if (!ticket) {
      throw new ConvexError("Ticket not found");
    }

    if (ticket.status === "used") {
      throw new ConvexError("Ticket has already been used");
    }

    if (ticket.status !== "confirmed") {
      throw new ConvexError("Ticket is not valid for use");
    }

    // Mark ticket as used
    await ctx.db.patch(ticket._id, {
      status: "used",
      usedAt: Date.now(),
    });

    return { success: true, ticket };
  },
});

// Get ticket types for an event
export const getTicketTypes = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const ticketTypes = await ctx.db
      .query("ticketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return ticketTypes;
  },
});

// Get ticket by code
export const getTicketByCode = query({
  args: {
    ticketCode: v.string(),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_ticket_code", (q) => q.eq("ticketCode", args.ticketCode))
      .first();

    if (!ticket) {
      throw new ConvexError("Ticket not found");
    }

    return ticket;
  },
});

// Get tickets by purchaser email
export const getTicketsByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .filter((q) => q.eq(q.field("purchaserEmail"), args.email))
      .collect();

    return tickets;
  },
});

// Get tickets for an event
export const getEventTickets = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return tickets;
  },
});

// Get tickets by transaction ID
export const getTicketsByTransaction = query({
  args: {
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId)
      )
      .collect();

    return tickets;
  },
});

// Cancel pending ticket payment and clean up tickets
export const cancelTicketPayment = mutation({
  args: {
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get payment details
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId)
      )
      .first();

    if (!payment) {
      throw new ConvexError("Payment not found");
    }

    if (payment.status !== "pending") {
      throw new ConvexError("Payment is not in pending status");
    }

    // Get tickets for this transaction
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId)
      )
      .collect();

    // Update payment status to failed
    await ctx.db.patch(payment._id, {
      status: "failed",
    });

    // Delete pending tickets (they were never confirmed)
    for (const ticket of tickets) {
      await ctx.db.delete(ticket._id);
    }

    return { success: true, cancelledTickets: tickets.length };
  },
});

// Clean up expired pending payments (older than 30 minutes)
export const cleanupExpiredPendingPayments = mutation({
  args: {},
  handler: async (ctx) => {
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000; // 30 minutes ago

    // Get all pending payments older than 30 minutes
    const expiredPayments = await ctx.db
      .query("payments")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("paymentType"), "ticket"),
          q.lt(q.field("createdAt"), thirtyMinutesAgo)
        )
      )
      .collect();

    let cleanedCount = 0;

    for (const payment of expiredPayments) {
      // Get tickets for this payment
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_transaction", (q) =>
          q.eq("transactionId", payment.transactionId)
        )
        .collect();

      // Update payment status to failed
      await ctx.db.patch(payment._id, {
        status: "failed",
      });

      // Delete the pending tickets
      for (const ticket of tickets) {
        await ctx.db.delete(ticket._id);
      }

      cleanedCount += tickets.length;
    }

    return {
      success: true,
      expiredPayments: expiredPayments.length,
      cleanedTickets: cleanedCount,
    };
  },
});

// Get available ticket count (excluding pending tickets older than 10 minutes)
export const getAvailableTicketCount = query({
  args: {
    ticketTypeId: v.id("ticketTypes"),
  },
  handler: async (ctx, args) => {
    const ticketType = await ctx.db.get(args.ticketTypeId);
    if (!ticketType) {
      return 0;
    }

    // Count recent pending tickets (last 10 minutes) that might still be valid
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const recentPendingTickets = await ctx.db
      .query("tickets")
      .withIndex("by_ticket_type", (q) =>
        q.eq("ticketTypeId", args.ticketTypeId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "pending"),
          q.gt(q.field("createdAt"), tenMinutesAgo)
        )
      )
      .collect();

    // Available = remaining - recent pending tickets
    return Math.max(0, ticketType.remaining - recentPendingTickets.length);
  },
});

// Admin function to manually trigger cleanup (can be called from admin dashboard)
export const adminCleanupExpiredPayments = mutation({
  args: {
    adminId: v.id("admins"), // Require admin authentication
  },
  handler: async (ctx, args) => {
    // Verify admin exists (basic auth check)
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Duplicate cleanup logic here since we can't call mutations from mutations
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000; // 30 minutes ago

    // Get all pending payments older than 30 minutes
    const expiredPayments = await ctx.db
      .query("payments")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("paymentType"), "ticket"),
          q.lt(q.field("createdAt"), thirtyMinutesAgo)
        )
      )
      .collect();

    let cleanedCount = 0;

    for (const payment of expiredPayments) {
      // Get tickets for this payment
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_transaction", (q) =>
          q.eq("transactionId", payment.transactionId)
        )
        .collect();

      // Update payment status to failed
      await ctx.db.patch(payment._id, {
        status: "failed",
      });

      // Delete the pending tickets
      for (const ticket of tickets) {
        await ctx.db.delete(ticket._id);
      }

      cleanedCount += tickets.length;
    }

    return {
      success: true,
      expiredPayments: expiredPayments.length,
      cleanedTickets: cleanedCount,
      triggeredBy: admin.email,
      triggeredAt: Date.now(),
    };
  },
});

// Get a single ticket type by ID
export const getTicketType = query({
  args: {
    ticketTypeId: v.id("ticketTypes"),
  },
  handler: async (ctx, args) => {
    const ticketType = await ctx.db.get(args.ticketTypeId);

    if (!ticketType) {
      throw new ConvexError("Ticket type not found");
    }

    return ticketType;
  },
});
