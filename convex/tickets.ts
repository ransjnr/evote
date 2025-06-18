import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Helper function to generate ticket code (since we can't import from lib in Convex)
const generateTicketCode = () => {
  const prefix = "TKT";
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random 6 chars
  return `${prefix}-${timestamp}-${random}`;
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

    // Create tickets
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

    // Update remaining tickets
    await ctx.db.patch(args.ticketTypeId, {
      remaining: ticketType.remaining - args.quantity,
    });

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
    // Update payment status
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

    // Update payment status
    await ctx.db.patch(payment._id, {
      status: "succeeded",
    });

    // Update ticket statuses
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId)
      )
      .collect();

    for (const ticket of tickets) {
      await ctx.db.patch(ticket._id, {
        status: "confirmed",
      });
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

    if (ticket.status !== "confirmed") {
      throw new ConvexError("Ticket is not valid for use");
    }

    if (ticket.status === "used") {
      throw new ConvexError("Ticket has already been used");
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
