import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create a new category
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    eventId: v.id("events"),
    type: v.union(v.literal("popular_vote"), v.literal("judge_vote")),
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Check if event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Insert the new category
    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      description: args.description,
      eventId: args.eventId,
      type: args.type,
      createdBy: args.adminId,
      createdAt: Date.now(),
    });

    return { success: true, categoryId };
  },
});

// Get category by ID
export const getCategory = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }
    return category;
  },
});

// List categories by event
export const listCategoriesByEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return categories;
  },
});

// List categories by department
export const listCategoriesByDepartment = query({
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

    // Get all categories for all these events
    let allCategories: any[] = [];

    for (const event of events) {
      const categories = await ctx.db
        .query("categories")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      allCategories = [...allCategories, ...categories];
    }

    return allCategories;
  },
});

// Update a category
export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(v.literal("popular_vote"), v.literal("judge_vote"))
    ),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Update the category
    await ctx.db.patch(args.categoryId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.type && { type: args.type }),
    });

    return { success: true };
  },
});

// Delete a category
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Check if there are nominees in this category
    const nominees = await ctx.db
      .query("nominees")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    if (nominees.length > 0) {
      throw new ConvexError(
        "Cannot delete category with nominees. Delete nominees first."
      );
    }

    // Delete the category
    await ctx.db.delete(args.categoryId);

    return { success: true };
  },
});
