import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create a new event with optional ticketing
export const createEvent = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    departmentId: v.id("departments"),
    startDate: v.number(),
    endDate: v.number(),
    votePrice: v.number(),
    adminId: v.id("admins"),
    isActive: v.boolean(),
    // Ticket-related fields
    hasTicketing: v.optional(v.boolean()),
    location: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    ticketSalesStartDate: v.optional(v.number()),
    ticketSalesEndDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify the department exists
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new ConvexError("Department not found");
    }

    // Verify that the admin has access to this department
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Super admins can access any department, regular admins only their own
    if (admin.role !== "super_admin") {
      if (department.slug !== admin.departmentId) {
        throw new ConvexError(
          "You don't have permission to create events for this department"
        );
      }
    }

    // Validate date ranges
    if (args.startDate >= args.endDate) {
      throw new ConvexError("End date must be after start date");
    }

    // Create the event
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      departmentId: args.departmentId,
      startDate: args.startDate,
      endDate: args.endDate,
      votePrice: args.votePrice,
      isActive: args.isActive,
      createdBy: args.adminId,
      createdAt: Date.now(),
      // Ticket-related fields
      hasTicketing: args.hasTicketing || false,
      location: args.location,
      maxCapacity: args.maxCapacity,
      ticketSalesStartDate: args.ticketSalesStartDate,
      ticketSalesEndDate: args.ticketSalesEndDate,
    });

    return { success: true, eventId };
  },
});

// Get an event by ID
export const getEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Get department details
    const department = await ctx.db.get(event.departmentId);

    // Count categories
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get ticket types if ticketing is enabled
    let ticketTypes = [];
    if (event.hasTicketing) {
      ticketTypes = await ctx.db
        .query("ticket_types")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();
    }

    return {
      ...event,
      department,
      categoriesCount: categories.length,
      ticketTypes,
    };
  },
});

// Get all events, with filters
export const listEvents = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    isActive: v.optional(v.boolean()),
    hasTicketing: v.optional(v.boolean()),
    includeEnded: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let eventsQuery = ctx.db.query("events");

    // Filter by department if provided
    if (args.departmentId) {
      eventsQuery = eventsQuery.withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId)
      );
    }

    // Apply filters
    if (args.isActive !== undefined) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field("isActive"), args.isActive!)
      );
    }

    if (args.hasTicketing !== undefined) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field("hasTicketing"), args.hasTicketing!)
      );
    }

    // Exclude ended events unless explicitly requested
    if (args.includeEnded !== true) {
      const now = Date.now();
      eventsQuery = eventsQuery.filter((q) => q.gte(q.field("endDate"), now));
    }

    const events = await eventsQuery.collect();

    // Get department details for each event
    const departmentIds = new Set(events.map((e) => e.departmentId));
    const departments = await Promise.all(
      Array.from(departmentIds).map((id) => ctx.db.get(id))
    );

    // Create a map for easy lookup
    const departmentsMap = new Map();
    departments.forEach((dept) => {
      if (dept) departmentsMap.set(dept._id, dept);
    });

    // Return events with department info
    return events.map((event) => ({
      ...event,
      department: departmentsMap.get(event.departmentId),
    }));
  },
});

// Get events with ticketing enabled
export const getEventsWithTicketing = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    includeEnded: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let eventsQuery = ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("hasTicketing"), true));

    // Filter by department if provided
    if (args.departmentId) {
      eventsQuery = eventsQuery.withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId)
      );
    }

    // Only include active events
    eventsQuery = eventsQuery.filter((q) => q.eq(q.field("isActive"), true));

    // Exclude ended events unless explicitly requested
    if (args.includeEnded !== true) {
      const now = Date.now();
      eventsQuery = eventsQuery.filter((q) => q.gte(q.field("endDate"), now));
    }

    const events = await eventsQuery.collect();

    // Get department and ticket type details for each event
    const results = await Promise.all(
      events.map(async (event) => {
        const department = await ctx.db.get(event.departmentId);

        const ticketTypes = await ctx.db
          .query("ticket_types")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        return {
          ...event,
          department,
          ticketTypes,
        };
      })
    );

    return results;
  },
});

// Toggle ticketing feature for an event
export const toggleEventTicketing = mutation({
  args: {
    eventId: v.id("events"),
    hasTicketing: v.boolean(),
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Verify the event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Verify that the admin has access to this event
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Super admins can access any department, regular admins only their own
    if (admin.role !== "super_admin") {
      const department = await ctx.db.get(event.departmentId);
      if (!department || department.slug !== admin.departmentId) {
        throw new ConvexError("You don't have permission to update this event");
      }
    }

    // If disabling ticketing, check if tickets have been sold
    if (!args.hasTicketing && event.hasTicketing) {
      // Check if there are any ticket reservations for this event
      const reservations = await ctx.db
        .query("ticket_reservations")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .first();

      if (reservations) {
        throw new ConvexError(
          "Cannot disable ticketing because tickets have already been sold"
        );
      }
    }

    // Update the event
    await ctx.db.patch(args.eventId, {
      hasTicketing: args.hasTicketing,
    });

    return { success: true };
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

// Update an existing event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    votePrice: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    adminId: v.id("admins"),
    // Ticket-related fields
    hasTicketing: v.optional(v.boolean()),
    location: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    ticketSalesStartDate: v.optional(v.number()),
    ticketSalesEndDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify the event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Verify that the admin has access to this event's department
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Super admins can access any department, regular admins only their own
    if (admin.role !== "super_admin") {
      const department = await ctx.db.get(event.departmentId);
      if (!department || department.slug !== admin.departmentId) {
        throw new ConvexError("You don't have permission to update this event");
      }
    }

    // Validate date ranges if both are provided
    if (args.startDate !== undefined && args.endDate !== undefined) {
      if (args.startDate >= args.endDate) {
        throw new ConvexError("End date must be after start date");
      }
    } else if (args.startDate !== undefined && event.endDate) {
      if (args.startDate >= event.endDate) {
        throw new ConvexError(
          "Start date must be before the existing end date"
        );
      }
    } else if (args.endDate !== undefined && event.startDate) {
      if (event.startDate >= args.endDate) {
        throw new ConvexError("End date must be after the existing start date");
      }
    }

    // Validate ticket sale dates if provided
    if (
      args.ticketSalesStartDate !== undefined &&
      args.ticketSalesEndDate !== undefined
    ) {
      if (args.ticketSalesStartDate >= args.ticketSalesEndDate) {
        throw new ConvexError("Ticket sales end date must be after start date");
      }
    }

    // Update the event
    await ctx.db.patch(args.eventId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.startDate !== undefined && { startDate: args.startDate }),
      ...(args.endDate !== undefined && { endDate: args.endDate }),
      ...(args.votePrice !== undefined && { votePrice: args.votePrice }),
      ...(args.isActive !== undefined && { isActive: args.isActive }),
      // Ticket-related fields
      ...(args.hasTicketing !== undefined && {
        hasTicketing: args.hasTicketing,
      }),
      ...(args.location !== undefined && { location: args.location }),
      ...(args.maxCapacity !== undefined && { maxCapacity: args.maxCapacity }),
      ...(args.ticketSalesStartDate !== undefined && {
        ticketSalesStartDate: args.ticketSalesStartDate,
      }),
      ...(args.ticketSalesEndDate !== undefined && {
        ticketSalesEndDate: args.ticketSalesEndDate,
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
