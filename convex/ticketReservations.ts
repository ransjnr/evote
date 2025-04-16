import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Helper function to generate a unique ticket code
function generateTicketCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  const random = new Uint8Array(length);
  crypto.getRandomValues(random);
  for (let i = 0; i < length; i++) {
    result += chars[random[i] % chars.length];
  }
  return result;
}

// Create a new ticket reservation
export const createReservation = mutation({
  args: {
    eventId: v.id("events"),
    ticketTypeId: v.id("ticket_types"),
    quantity: v.number(),
    attendeeName: v.string(),
    attendeeEmail: v.string(),
    attendeePhone: v.optional(v.string()),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if the event and ticket type exist
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const ticketType = await ctx.db.get(args.ticketTypeId);
    if (!ticketType) {
      throw new Error("Ticket type not found");
    }

    // Create the reservation
    const reservationId = await ctx.db.insert("ticket_reservations", {
      eventId: args.eventId,
      ticketTypeId: args.ticketTypeId,
      quantity: args.quantity,
      attendeeName: args.attendeeName,
      attendeeEmail: args.attendeeEmail,
      attendeePhone: args.attendeePhone,
      totalAmount: args.totalAmount,
      isPaid: false,
      createdAt: new Date().toISOString(),
    });

    return reservationId;
  },
});

// Get a single reservation with related data
export const getReservation = query({
  args: {
    reservationId: v.id("ticket_reservations"),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    const event = await ctx.db.get(reservation.eventId);
    const ticketType = await ctx.db.get(reservation.ticketTypeId);

    if (!event || !ticketType) {
      throw new Error("Related event or ticket type not found");
    }

    return {
      reservation,
      event,
      ticketType,
    };
  },
});

// Mark a reservation as paid
export const markReservationAsPaid = mutation({
  args: {
    reservationId: v.id("ticket_reservations"),
    paymentMethod: v.string(),
    paymentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (reservation.isPaid) {
      throw new Error("Reservation is already paid");
    }

    // Generate a unique ticket code
    const ticketCode = generateTicketCode(10);

    // Update the reservation
    await ctx.db.patch(args.reservationId, {
      isPaid: true,
      paidAt: new Date().toISOString(),
      paymentMethod: args.paymentMethod,
      paymentReference: args.paymentReference,
      ticketCode: ticketCode,
      isCheckedIn: false,
      ticketSentEmail: false,
      ticketSentSms: false,
    });

    // Generate a QR code for the ticket
    await ctx.scheduler.runAfter(0, internal.qrcode.generateTicketQRCode, {
      reservationId: args.reservationId,
    });

    return args.reservationId;
  },
});

// Mark a ticket as checked in
export const checkInTicket = mutation({
  args: {
    ticketCode: v.string(),
    eventId: v.id("events"),
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Find the reservation by ticket code
    const reservation = await ctx.db
      .query("ticket_reservations")
      .withIndex("by_ticket_code", (q) => q.eq("ticketCode", args.ticketCode))
      .first();

    if (!reservation) {
      // Log the check-in attempt with failure status
      await ctx.db.insert("check_in_logs", {
        ticketCode: args.ticketCode,
        eventId: args.eventId,
        scannedBy: args.adminId,
        scannedAt: Date.now(),
        status: "invalid_ticket",
        reservationId: "" as unknown as Id<"ticket_reservations">, // Placeholder as it's required
      });

      throw new ConvexError("Invalid ticket code");
    }

    // Verify it's for the correct event
    if (reservation.eventId !== args.eventId) {
      // Log the check-in attempt with failure status
      await ctx.db.insert("check_in_logs", {
        reservationId: reservation._id,
        eventId: args.eventId,
        ticketCode: args.ticketCode,
        scannedBy: args.adminId,
        scannedAt: Date.now(),
        status: "wrong_event",
      });

      throw new ConvexError("This ticket is for a different event");
    }

    // Check if already checked in
    if (reservation.isCheckedIn) {
      // Log the check-in attempt with failure status
      await ctx.db.insert("check_in_logs", {
        reservationId: reservation._id,
        eventId: args.eventId,
        ticketCode: args.ticketCode,
        scannedBy: args.adminId,
        scannedAt: Date.now(),
        status: "already_checked_in",
      });

      throw new ConvexError(
        `This ticket has already been checked in at ${new Date(
          reservation.checkedInAt || 0
        ).toLocaleString()}`
      );
    }

    // Verify it's paid
    if (!reservation.isPaid) {
      throw new ConvexError("This ticket has not been paid for");
    }

    const now = Date.now();

    // Mark as checked in
    await ctx.db.patch(reservation._id, {
      isCheckedIn: true,
      checkedInAt: now,
    });

    // Log the successful check-in
    await ctx.db.insert("check_in_logs", {
      reservationId: reservation._id,
      eventId: args.eventId,
      ticketCode: args.ticketCode,
      scannedBy: args.adminId,
      scannedAt: now,
      status: "success",
    });

    return {
      success: true,
      buyerName: reservation.attendeeName,
      ticketType: await ctx.db.get(reservation.ticketTypeId),
      quantity: reservation.quantity,
    };
  },
});

// Get reservation by ticket code
export const getReservationByCode = query({
  args: {
    ticketCode: v.string(),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db
      .query("ticket_reservations")
      .withIndex("by_ticket_code", (q) => q.eq("ticketCode", args.ticketCode))
      .first();

    if (!reservation) {
      throw new ConvexError("Ticket not found");
    }

    // Get the ticket type details
    const ticketType = await ctx.db.get(reservation.ticketTypeId);

    // Get the event details
    const event = await ctx.db.get(reservation.eventId);

    return {
      reservation,
      ticketType,
      event,
    };
  },
});

// Get all reservations for an event
export const getReservationsByEvent = query({
  args: {
    eventId: v.id("events"),
    isPaid: v.optional(v.boolean()),
    isCheckedIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Start with base query
    let reservationsQuery = ctx.db
      .query("ticket_reservations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId));

    // Apply filters if provided
    if (args.isPaid !== undefined) {
      reservationsQuery = reservationsQuery.filter((q) =>
        q.eq(q.field("isPaid"), args.isPaid!)
      );
    }

    if (args.isCheckedIn !== undefined) {
      reservationsQuery = reservationsQuery.filter((q) =>
        q.eq(q.field("isCheckedIn"), args.isCheckedIn!)
      );
    }

    // Execute the query
    const reservations = await reservationsQuery.collect();

    // Get the ticket type details for each reservation
    const ticketTypeIds = new Set(reservations.map((r) => r.ticketTypeId));
    const ticketTypes = await Promise.all(
      Array.from(ticketTypeIds).map((id) => ctx.db.get(id))
    );

    // Create a map for easy lookup
    const ticketTypesMap = new Map();
    ticketTypes.forEach((tt) => {
      if (tt) ticketTypesMap.set(tt._id, tt);
    });

    // Return the reservations with ticket type details
    return reservations.map((reservation) => ({
      ...reservation,
      ticketType: ticketTypesMap.get(reservation.ticketTypeId),
    }));
  },
});

// Get reservations count and stats for an event
export const getEventTicketStats = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Get all reservations for this event
    const reservations = await ctx.db
      .query("ticket_reservations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get all ticket types for this event
    const ticketTypes = await ctx.db
      .query("ticket_types")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Calculate stats
    let totalTickets = 0;
    let totalSoldTickets = 0;
    let totalPaid = 0;
    let totalRevenue = 0;
    let totalCheckedIn = 0;

    // Stats per ticket type
    const ticketTypeStats = ticketTypes.map((tt) => {
      const relevantReservations = reservations.filter(
        (r) => r.ticketTypeId === tt._id
      );

      const soldQuantity = relevantReservations.reduce(
        (sum, r) => sum + r.quantity,
        0
      );

      const paidReservations = relevantReservations.filter((r) => r.isPaid);
      const paidQuantity = paidReservations.reduce(
        (sum, r) => sum + r.quantity,
        0
      );

      const paidAmount = paidReservations.reduce(
        (sum, r) => sum + r.totalAmount,
        0
      );

      const checkedInCount = relevantReservations.filter(
        (r) => r.isCheckedIn
      ).length;

      // Update global stats
      totalTickets += tt.capacity;
      totalSoldTickets += soldQuantity;
      totalPaid += paidQuantity;
      totalRevenue += paidAmount;
      totalCheckedIn += checkedInCount;

      return {
        ticketType: tt,
        soldQuantity,
        paidQuantity,
        paidAmount,
        checkedInCount,
        percentageSold:
          tt.capacity > 0 ? (soldQuantity / tt.capacity) * 100 : 0,
      };
    });

    return {
      event,
      totalStats: {
        totalTickets,
        totalSoldTickets,
        totalPaid,
        totalRevenue,
        totalCheckedIn,
        percentageSold:
          totalTickets > 0 ? (totalSoldTickets / totalTickets) * 100 : 0,
      },
      ticketTypeStats,
    };
  },
});

// Cancel a reservation (only if not paid)
export const cancelReservation = mutation({
  args: {
    reservationId: v.id("ticket_reservations"),
  },
  handler: async (ctx, args) => {
    // Verify reservation exists
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) {
      throw new ConvexError("Reservation not found");
    }

    // Check if already paid
    if (reservation.isPaid) {
      throw new ConvexError("Cannot cancel a paid reservation");
    }

    // Get the ticket type to update remaining capacity
    const ticketType = await ctx.db.get(reservation.ticketTypeId);
    if (!ticketType) {
      throw new ConvexError("Ticket type not found");
    }

    // Update the ticket type's remaining capacity
    await ctx.db.patch(ticketType._id, {
      remainingCapacity: ticketType.remainingCapacity + reservation.quantity,
    });

    // Delete the reservation
    await ctx.db.delete(args.reservationId);

    return { success: true };
  },
});

// Helper function to parse a reservation ID from string format
export const parseReservationId = query({
  args: {
    reservationId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      return ctx.db.normalizeId("ticket_reservations", args.reservationId);
    } catch (error) {
      throw new ConvexError("Invalid reservation ID format");
    }
  },
});

// Get check-in stats for an event
export const getCheckInStats = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Get all paid reservations for this event
    const reservations = await ctx.db
      .query("ticket_reservations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("isPaid"), true))
      .collect();
    
    const total = reservations.length;
    const checkedIn = reservations.filter((r) => r.isCheckedIn).length;
    
    return {
      total,
      checkedIn,
      notCheckedIn: total - checkedIn,
      checkedInPercentage: total > 0 ? (checkedIn / total) * 100 : 0,
    };
  },
});
