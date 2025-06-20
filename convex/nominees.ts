import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Generates an abbreviation from the department name (takes first letter of each word)
function generateAbbreviation(name: string): string {
  return name
    .split(/\s+/) // Split by whitespace
    .map((word) => word.charAt(0).toUpperCase()) // Get first char of each word, uppercase
    .join(""); // Join them together
}

// Create a new nominee
export const createNominee = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    categoryId: v.id("categories"),
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Check if category exists
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Get the event to get the department
    const event = await ctx.db.get(category.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    // Get the department name to generate abbreviation
    const department = await ctx.db.get(event.departmentId);
    if (!department) {
      throw new ConvexError("Department not found");
    }

    // Generate abbreviation from department name
    const deptAbbrev = generateAbbreviation(department.name);

    // Get current count of nominees in this department to generate a unique 3-digit number
    const allNomineesInDept = await ctx.db
      .query("nominees")
      .filter(
        (q) =>
          q.gt(q.field("code"), deptAbbrev) &&
          q.lt(q.field("code"), deptAbbrev + "\uffff")
      )
      .collect();

    // Generate a 3-digit number, starting from 001
    let codeNum = (allNomineesInDept.length + 1).toString().padStart(3, "0");

    // Combine to form the code
    const nomineeCode = `${deptAbbrev}${codeNum}`;

    // Check if this code already exists (very unlikely but possible if abbreviations overlap)
    let codeExists = await ctx.db
      .query("nominees")
      .withIndex("by_code", (q) => q.eq("code", nomineeCode))
      .first();

    // If code already exists, try incrementing until we find a unique one
    let attempts = 0;
    while (codeExists && attempts < 100) {
      codeNum = (parseInt(codeNum) + 1).toString().padStart(3, "0");
      const newCode = `${deptAbbrev}${codeNum}`;
      codeExists = await ctx.db
        .query("nominees")
        .withIndex("by_code", (q) => q.eq("code", newCode))
        .first();
      attempts++;
    }

    // Final code to use
    const finalCode = `${deptAbbrev}${codeNum}`;

    // Insert the new nominee
    const nomineeId = await ctx.db.insert("nominees", {
      name: args.name,
      description: args.description,
      imageUrl: args.imageUrl,
      videoUrl: args.videoUrl,
      categoryId: args.categoryId,
      code: finalCode, // Add the automatically generated code
      createdBy: args.adminId,
      createdAt: Date.now(),
    });

    return { success: true, nomineeId, code: finalCode };
  },
});

// Get nominee by ID
export const getNominee = query({
  args: {
    nomineeId: v.id("nominees"),
  },
  handler: async (ctx, args) => {
    const nominee = await ctx.db.get(args.nomineeId);
    if (!nominee) {
      throw new ConvexError("Nominee not found");
    }
    return nominee;
  },
});

// List nominees by category
export const listNomineesByCategory = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const nominees = await ctx.db
      .query("nominees")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    return nominees;
  },
});

// List all nominees
export const listAllNominees = query({
  args: {},
  handler: async (ctx) => {
    const nominees = await ctx.db.query("nominees").collect();
    return nominees;
  },
});

// List nominees by department
export const listNomineesByDepartment = query({
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

    if (events.length === 0) {
      return [];
    }

    // Get all categories for these events
    const eventIds = events.map((event) => event._id);
    let allCategories: any[] = [];

    for (const eventId of eventIds) {
      const categories = await ctx.db
        .query("categories")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();

      allCategories = [...allCategories, ...categories];
    }

    if (allCategories.length === 0) {
      return [];
    }

    // Get all nominees for these categories
    const categoryIds = allCategories.map((category) => category._id);
    let allNominees: any[] = [];

    for (const categoryId of categoryIds) {
      const nominees = await ctx.db
        .query("nominees")
        .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
        .collect();

      allNominees = [...allNominees, ...nominees];
    }

    return allNominees;
  },
});

// Get nominee by code (for USSD integration)
export const getNomineeByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const nominee = await ctx.db
      .query("nominees")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!nominee) {
      throw new ConvexError("Nominee not found with the provided code");
    }

    return nominee;
  },
});

// Update a nominee
export const updateNominee = mutation({
  args: {
    nomineeId: v.id("nominees"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nominee = await ctx.db.get(args.nomineeId);
    if (!nominee) {
      throw new ConvexError("Nominee not found");
    }

    // Update the nominee (note: we don't allow updating the code)
    await ctx.db.patch(args.nomineeId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.imageUrl !== undefined && { imageUrl: args.imageUrl }),
      ...(args.videoUrl !== undefined && { videoUrl: args.videoUrl }),
    });

    return { success: true };
  },
});

// Delete a nominee
export const deleteNominee = mutation({
  args: {
    nomineeId: v.id("nominees"),
  },
  handler: async (ctx, args) => {
    const nominee = await ctx.db.get(args.nomineeId);
    if (!nominee) {
      throw new ConvexError("Nominee not found");
    }

    // Check if there are votes for this nominee
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_nominee", (q) => q.eq("nomineeId", args.nomineeId))
      .collect();

    if (votes.length > 0) {
      throw new ConvexError("Cannot delete nominee with votes");
    }

    // Delete the nominee
    await ctx.db.delete(args.nomineeId);

    return { success: true };
  },
});

// Get vote count by nominee
export const getNomineeVoteCount = query({
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
