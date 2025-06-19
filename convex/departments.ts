import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create a new department
export const createDepartment = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.string(),
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    console.log("Looking for department with slug:", args.slug);
    // Check if slug already exists
    const existingDepartment = await ctx.db
      .query("departments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingDepartment) {
      throw new ConvexError("Department with this slug already exists");
    }

    // Insert the new department
    const departmentId = await ctx.db.insert("departments", {
      name: args.name,
      description: args.description,
      slug: args.slug,
      createdBy: args.adminId,
      createdAt: Date.now(),
    });

    return { success: true, departmentId };
  },
});

// Get a department by ID
export const getDepartment = query({
  args: {
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new ConvexError("Department not found");
    }
    return department;
  },
});

// List all departments
export const listDepartments = query({
  args: {},
  handler: async (ctx) => {
    const departments = await ctx.db.query("departments").collect();
    return departments;
  },
});

// Get department by slug
export const getDepartmentBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const department = await ctx.db
      .query("departments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!department) {
      throw new ConvexError("Department not found");
    }

    return department;
  },
});

// Update a department
export const updateDepartment = mutation({
  args: {
    departmentId: v.id("departments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new ConvexError("Department not found");
    }

    // Check if new slug already exists (if updating the slug)
    if (args.slug && args.slug !== department.slug) {
      const existingDepartment = await ctx.db
        .query("departments")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .first();

      if (existingDepartment) {
        throw new ConvexError("Department with this slug already exists");
      }
    }

    // Update the department
    await ctx.db.patch(args.departmentId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.slug && { slug: args.slug }),
    });

    return { success: true };
  },
});
