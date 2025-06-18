import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create a new event
export const createEvent = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    departmentId: v.id("departments"),
    startDate: v.number(),
    endDate: v.number(),
    votePrice: v.optional(v.number()),
    adminId: v.id("admins"),
    eventType: v.union(
      v.literal("voting_only"),
      v.literal("ticketing_only"),
      v.literal("voting_and_ticketing")
    ),
    venue: v.optional(v.string()),
    maxAttendees: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate dates
    if (args.startDate >= args.endDate) {
      throw new ConvexError("End date must be after start date");
    }

    // Validate vote price for events that include voting
    if (
      args.eventType === "voting_only" ||
      args.eventType === "voting_and_ticketing"
    ) {
      if (!args.votePrice || args.votePrice <= 0) {
        throw new ConvexError(
          "Vote price must be greater than 0 for voting events"
        );
      }
    }

    // Validate venue for events that include ticketing
    if (
      args.eventType === "ticketing_only" ||
      args.eventType === "voting_and_ticketing"
    ) {
      if (!args.venue || args.venue.trim() === "") {
        throw new ConvexError("Venue is required for ticketing events");
      }
      if (!args.maxAttendees || args.maxAttendees <= 0) {
        throw new ConvexError(
          "Maximum attendees must be greater than 0 for ticketing events"
        );
      }
    }

    // Insert the new event
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      departmentId: args.departmentId,
      startDate: args.startDate,
      endDate: args.endDate,
      votePrice: args.votePrice,
      isActive: false, // Events start as inactive
      createdBy: args.adminId,
      createdAt: Date.now(),
      eventType: args.eventType,
      venue: args.venue,
      maxAttendees: args.maxAttendees,
    });

    return { success: true, eventId };
  },
});

// Get event by ID
export const getEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }
    return event;
  },
});

// List events by department
export const listEventsByDepartment = query({
  args: {
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId)
      )
      .collect();

    return events;
  },
});

// List active events
export const listActiveEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return events;
  },
});

// List all events
export const listAllEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .order("desc")
      .collect();

    return events;
  },
});

// List all events with ticketing enabled
export const listTicketingEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => 
        q.or(
          q.eq(q.field("eventType"), "ticketing_only"),
          q.eq(q.field("eventType"), "voting_and_ticketing")
        )
      )
      .order("desc")
      .collect();

    // Enhance events with department information
    const enhancedEvents = await Promise.all(
      events.map(async (event) => {
        const department = await ctx.db.get(event.departmentId);
        return {
          ...event,
          departmentName: department?.name || "Unknown Department",
        };
      })
    );

    return enhancedEvents;
  },
});

// Get event status (upcoming, running, or ended)
export const getEventStatus = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    const now = Date.now();
    let status = "upcoming";

    if (now > event.endDate) {
      status = "ended";
    } else if (now >= event.startDate && now <= event.endDate) {
      status = "running";
    }

    return { status };
  },
});

// Update an event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    votePrice: v.optional(v.number()),
    eventType: v.optional(
      v.union(
        v.literal("voting_only"),
        v.literal("ticketing_only"),
        v.literal("voting_and_ticketing")
      )
    ),
    venue: v.optional(v.string()),
    maxAttendees: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Validate dates if provided
    if (args.startDate && args.endDate) {
      if (args.startDate >= args.endDate) {
        throw new ConvexError("End date must be after start date");
      }
    } else if (args.startDate && !args.endDate) {
      if (args.startDate >= event.endDate) {
        throw new ConvexError("Start date must be before end date");
      }
    } else if (!args.startDate && args.endDate) {
      if (event.startDate >= args.endDate) {
        throw new ConvexError("End date must be after start date");
      }
    }

    // Determine the event type to use for validation
    const eventType = args.eventType || event.eventType;

    // Validate vote price for events that include voting
    if (args.votePrice !== undefined) {
      if (eventType === "voting_only" || eventType === "voting_and_ticketing") {
        if (args.votePrice <= 0) {
          throw new ConvexError(
            "Vote price must be greater than 0 for voting events"
          );
        }
      }
    }

    // Validate venue and maxAttendees for events that include ticketing
    if (
      args.eventType === "ticketing_only" ||
      args.eventType === "voting_and_ticketing"
    ) {
      if (
        args.venue !== undefined &&
        (!args.venue || args.venue.trim() === "")
      ) {
        throw new ConvexError("Venue is required for ticketing events");
      }
      if (
        args.maxAttendees !== undefined &&
        (!args.maxAttendees || args.maxAttendees <= 0)
      ) {
        throw new ConvexError(
          "Maximum attendees must be greater than 0 for ticketing events"
        );
      }
    }

    // Update the event
    await ctx.db.patch(args.eventId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.startDate && { startDate: args.startDate }),
      ...(args.endDate && { endDate: args.endDate }),
      ...(args.votePrice !== undefined && { votePrice: args.votePrice }),
      ...(args.eventType && { eventType: args.eventType }),
      ...(args.venue !== undefined && { venue: args.venue }),
      ...(args.maxAttendees !== undefined && {
        maxAttendees: args.maxAttendees,
      }),
    });

    return { success: true };
  },
});

// Activate/deactivate an event
export const toggleEventStatus = mutation({
  args: {
    eventId: v.id("events"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    await ctx.db.patch(args.eventId, {
      isActive: args.isActive,
    });

    return { success: true };
  },
});

// Delete an event
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Check if there are votes for this event
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    if (votes.length > 0) {
      throw new ConvexError("Cannot delete event with existing votes");
    }

    // Get categories for this event
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Delete all nominees in each category
    for (const category of categories) {
      const nominees = await ctx.db
        .query("nominees")
        .withIndex("by_category", (q) => q.eq("categoryId", category._id))
        .collect();

      // Delete each nominee
      for (const nominee of nominees) {
        await ctx.db.delete(nominee._id);
      }

      // Delete the category
      await ctx.db.delete(category._id);
    }

    // Delete the event
    await ctx.db.delete(args.eventId);

    return { success: true };
  },
});
