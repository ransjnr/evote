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

    // Return null instead of throwing an error to allow graceful handling
    return department || null;
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

// Get active departments only (created by non-deleted admins)
export const getActiveDepartments = query({
  args: {},
  handler: async (ctx) => {
    const departments = await ctx.db.query("departments").collect();

    // Filter out departments created by deleted admins
    const activeDepartments = [];

    for (const department of departments) {
      const createdByAdmin = await ctx.db.get(department.createdBy);
      if (createdByAdmin && !createdByAdmin.isDeleted) {
        activeDepartments.push(department);
      }
    }

    return activeDepartments;
  },
});

// Delete a department (super admin only)
export const deleteDepartment = mutation({
  args: {
    departmentId: v.id("departments"),
    superAdminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Verify super admin privileges
    const superAdmin = await ctx.db.get(args.superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      throw new ConvexError(
        "Unauthorized: Only super admins can delete departments"
      );
    }

    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new ConvexError("Department not found");
    }

    // Check if department has any events
    const events = await ctx.db
      .query("events")
      .withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId)
      )
      .collect();

    if (events.length > 0) {
      throw new ConvexError(
        "Cannot delete department with existing events. Delete all events first."
      );
    }

    // Check if department has any admins
    const admins = await ctx.db
      .query("admins")
      .filter((q) => q.eq(q.field("departmentId"), department.slug))
      .collect();

    if (admins.length > 0) {
      throw new ConvexError(
        "Cannot delete department with existing admins. Move or delete all admins first."
      );
    }

    // Delete the department
    await ctx.db.delete(args.departmentId);

    return { success: true };
  },
});

// Get department statistics
export const getDepartmentStats = query({
  args: {
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new ConvexError("Department not found");
    }

    // Get events count
    const events = await ctx.db
      .query("events")
      .withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId)
      )
      .collect();

    // Get admins count
    const admins = await ctx.db
      .query("admins")
      .filter((q) => q.eq(q.field("departmentId"), department.slug))
      .collect();

    // Get active events count
    const activeEvents = events.filter((event) => event.isActive);

    // Get categories count
    let totalCategories = 0;
    for (const event of events) {
      const categories = await ctx.db
        .query("categories")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      totalCategories += categories.length;
    }

    // Get nominees count
    let totalNominees = 0;
    for (const event of events) {
      const categories = await ctx.db
        .query("categories")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      for (const category of categories) {
        const nominees = await ctx.db
          .query("nominees")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();
        totalNominees += nominees.length;
      }
    }

    // Get votes count
    let totalVotes = 0;
    for (const event of events) {
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      totalVotes += votes.length;
    }

    // Get tickets count
    let totalTickets = 0;
    for (const event of events) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      totalTickets += tickets.length;
    }

    return {
      department,
      stats: {
        totalEvents: events.length,
        activeEvents: activeEvents.length,
        totalAdmins: admins.length,
        activeAdmins: admins.filter((admin) => !admin.isDeleted).length,
        totalCategories,
        totalNominees,
        totalVotes,
        totalTickets,
      },
    };
  },
});

// Get departments with their statistics (super admin only)
export const getDepartmentsWithStats = query({
  args: {},
  handler: async (ctx) => {
    const departments = await ctx.db.query("departments").collect();

    const departmentsWithStats = await Promise.all(
      departments.map(async (department) => {
        // Get events count
        const events = await ctx.db
          .query("events")
          .withIndex("by_department", (q) =>
            q.eq("departmentId", department._id)
          )
          .collect();

        // Get admins count
        const admins = await ctx.db
          .query("admins")
          .filter((q) => q.eq(q.field("departmentId"), department.slug))
          .collect();

        // Get creator admin info
        const createdBy = await ctx.db.get(department.createdBy);

        return {
          ...department,
          totalEvents: events.length,
          activeEvents: events.filter((event) => event.isActive).length,
          totalAdmins: admins.length,
          activeAdmins: admins.filter((admin) => !admin.isDeleted).length,
          createdBy: createdBy
            ? {
                _id: createdBy._id,
                name: createdBy.name,
                email: createdBy.email,
                isDeleted: createdBy.isDeleted || false,
              }
            : null,
        };
      })
    );

    return departmentsWithStats;
  },
});
