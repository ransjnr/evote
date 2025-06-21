import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// A simple hash function for password (for development only)
// In production, you should use a proper password hashing library in an action
function simpleHash(password: string) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return (
    hash.toString() +
    "_" +
    password.length +
    "_" +
    Date.now().toString().substring(0, 8)
  );
}

// Verify a password against the simple hash
function verifySimpleHash(password: string, hash: string) {
  const parts = hash.split("_");
  if (parts.length !== 3) return false;

  const originalHash = parseInt(parts[0]);
  const originalLength = parseInt(parts[1]);

  if (originalLength !== password.length) return false;

  let newHash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    newHash = (newHash << 5) - newHash + char;
    newHash = newHash & newHash; // Convert to 32bit integer
  }

  return newHash.toString() === originalHash.toString();
}

// Register a new admin user
export const registerAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    departmentId: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("department_admin")),
    departmentName: v.optional(v.string()),
    departmentDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existingUser = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("Email already exists");
    }

    // Check if department slug already exists
    const existingDepartment = await ctx.db
      .query("departments")
      .withIndex("by_slug", (q) => q.eq("slug", args.departmentId))
      .first();

    if (existingDepartment) {
      throw new ConvexError("Department with this slug already exists");
    }

    // Hash password using our simple hash function
    const passwordHash = simpleHash(args.password);

    // Insert the new admin
    const adminId = await ctx.db.insert("admins", {
      email: args.email,
      passwordHash,
      name: args.name,
      departmentId: args.departmentId,
      role: args.role,
      isVerified: args.role === "super_admin" ? true : false, // Super admins are auto-verified
      createdAt: Date.now(),
    });

    // Create the department if department details are provided
    if (args.departmentName) {
      await ctx.db.insert("departments", {
        name: args.departmentName,
        description: args.departmentDescription,
        slug: args.departmentId,
        createdBy: adminId,
        createdAt: Date.now(),
      });
    }

    return { success: true, adminId };
  },
});

// Login an admin user
export const loginAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!admin) {
      throw new ConvexError("Invalid email or password");
    }

    // Verify the password
    const isPasswordValid = verifySimpleHash(args.password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new ConvexError("Invalid email or password");
    }

    // Check if the admin account is deleted
    if (admin.isDeleted) {
      throw new ConvexError(
        "Your account has been deactivated. Please contact the super admin."
      );
    }

    // Check if the admin account is verified (except for super_admin)
    if (admin.role !== "super_admin" && !admin.isVerified) {
      throw new ConvexError(
        "Your account is pending verification by a super admin"
      );
    }

    // Return user data (excluding password hash)
    return {
      success: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        departmentId: admin.departmentId,
        role: admin.role,
        isVerified: admin.isVerified,
      },
    };
  },
});

// Get admin by ID
export const getAdmin = query({
  args: {
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Don't return deleted admins unless specifically requested
    if (admin.isDeleted) {
      throw new ConvexError("Admin not found");
    }

    // Return admin data without password hash
    return {
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      departmentId: admin.departmentId,
      role: admin.role,
      isVerified: admin.isVerified,
      verifiedAt: admin.verifiedAt,
    };
  },
});

// Check if email exists (only for active admins)
export const checkEmailExists = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    // Only count as existing if the admin is not deleted
    return !!admin && !admin.isDeleted;
  },
});

// Update admin department
export const updateAdminDepartment = mutation({
  args: {
    adminId: v.id("admins"),
    departmentId: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    await ctx.db.patch(args.adminId, {
      departmentId: args.departmentId,
    });

    return { success: true };
  },
});

// Update admin profile
export const updateAdminProfile = mutation({
  args: {
    adminId: v.id("admins"),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if admin exists
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Check if email is being changed and if it's already in use
    if (admin.email !== args.email) {
      const existingAdmin = await ctx.db
        .query("admins")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (existingAdmin) {
        throw new ConvexError("Email already in use");
      }
    }

    // Update admin profile
    await ctx.db.patch(args.adminId, {
      name: args.name,
      email: args.email,
    });

    return {
      success: true,
      admin: {
        _id: args.adminId,
        name: args.name,
        email: args.email,
        departmentId: admin.departmentId,
        role: admin.role,
        isVerified: admin.isVerified,
      },
    };
  },
});

// Update admin password
export const updateAdminPassword = mutation({
  args: {
    adminId: v.id("admins"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if admin exists
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Verify the current password
    const isPasswordValid = verifySimpleHash(
      args.currentPassword,
      admin.passwordHash
    );
    if (!isPasswordValid) {
      throw new ConvexError("Current password is incorrect");
    }

    // Hash the new password
    const newPasswordHash = simpleHash(args.newPassword);

    // Update the password
    await ctx.db.patch(args.adminId, {
      passwordHash: newPasswordHash,
    });

    return { success: true };
  },
});

// Get all pending admin verifications (for super admins)
export const getPendingAdminVerifications = query({
  args: {},
  handler: async (ctx) => {
    const pendingAdmins = await ctx.db
      .query("admins")
      .filter((q) =>
        q.and(
          q.eq(q.field("isVerified"), false),
          q.neq(q.field("isDeleted"), true)
        )
      )
      .collect();

    // Return admins without password hashes
    return pendingAdmins.map((admin) => ({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      departmentId: admin.departmentId,
      role: admin.role,
      createdAt: admin.createdAt,
    }));
  },
});

// Verify an admin account (super admin only)
export const verifyAdminAccount = mutation({
  args: {
    adminId: v.id("admins"),
    superAdminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Get the super admin who is verifying
    const superAdmin = await ctx.db.get(args.superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      throw new ConvexError(
        "Unauthorized: Only super admins can verify accounts"
      );
    }

    // Get the admin to be verified
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Update the admin to be verified
    await ctx.db.patch(args.adminId, {
      isVerified: true,
      verifiedBy: args.superAdminId,
      verifiedAt: Date.now(),
    });

    return { success: true };
  },
});

// Revoke admin verification (super admin only)
export const revokeAdminVerification = mutation({
  args: {
    adminId: v.id("admins"),
    superAdminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Get the super admin who is revoking
    const superAdmin = await ctx.db.get(args.superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      throw new ConvexError(
        "Unauthorized: Only super admins can revoke verification"
      );
    }

    // Get the admin to be unverified
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Cannot revoke verification for super admins
    if (admin.role === "super_admin") {
      throw new ConvexError("Cannot revoke verification for super admins");
    }

    // We'll just set isVerified to false
    // But maintain the historical record of when/who verified them
    // This avoids schema validation errors with null values
    await ctx.db.patch(args.adminId, {
      isVerified: false,
      // Add a field to track revocation info instead of removing existing fields
      revokedBy: args.superAdminId,
      revokedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get all admins (for super admins)
export const getAllAdmins = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db.query("admins").collect();

    // Return admins without password hashes, including deleted ones for super admin view
    return admins.map((admin) => ({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      departmentId: admin.departmentId,
      role: admin.role,
      isVerified: admin.isVerified,
      verifiedAt: admin.verifiedAt,
      isDeleted: admin.isDeleted || false,
      deletedAt: admin.deletedAt,
      restoredAt: admin.restoredAt,
      createdAt: admin.createdAt,
    }));
  },
});

// Get active admins only (excluding deleted ones)
export const getActiveAdmins = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("admins")
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .collect();

    // Return admins without password hashes
    return admins.map((admin) => ({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      departmentId: admin.departmentId,
      role: admin.role,
      isVerified: admin.isVerified,
      verifiedAt: admin.verifiedAt,
      createdAt: admin.createdAt,
    }));
  },
});

// Delete admin account (super admin only) - soft delete
export const deleteAdminAccount = mutation({
  args: {
    adminId: v.id("admins"),
    superAdminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Get the super admin who is deleting
    const superAdmin = await ctx.db.get(args.superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      throw new ConvexError(
        "Unauthorized: Only super admins can delete accounts"
      );
    }

    // Get the admin to be deleted
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Cannot delete super admins
    if (admin.role === "super_admin") {
      throw new ConvexError("Cannot delete super admin accounts");
    }

    // Cannot delete already deleted accounts
    if (admin.isDeleted) {
      throw new ConvexError("Admin account is already deleted");
    }

    // Soft delete the admin account
    await ctx.db.patch(args.adminId, {
      isDeleted: true,
      deletedBy: args.superAdminId,
      deletedAt: Date.now(),
      isVerified: false, // Also revoke verification
    });

    return { success: true };
  },
});

// Restore admin account (super admin only)
export const restoreAdminAccount = mutation({
  args: {
    adminId: v.id("admins"),
    superAdminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Get the super admin who is restoring
    const superAdmin = await ctx.db.get(args.superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      throw new ConvexError(
        "Unauthorized: Only super admins can restore accounts"
      );
    }

    // Get the admin to be restored
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Cannot restore accounts that aren't deleted
    if (!admin.isDeleted) {
      throw new ConvexError("Admin account is not deleted");
    }

    // Restore the admin account
    await ctx.db.patch(args.adminId, {
      isDeleted: false,
      restoredBy: args.superAdminId,
      restoredAt: Date.now(),
      isVerified: true, // Restore with verification
    });

    return { success: true };
  },
});

// Permanently delete admin account and all associated data (super admin only)
export const permanentlyDeleteAdminAccount = mutation({
  args: {
    adminId: v.id("admins"),
    superAdminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Get the super admin who is permanently deleting
    const superAdmin = await ctx.db.get(args.superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      throw new ConvexError(
        "Unauthorized: Only super admins can permanently delete accounts"
      );
    }

    // Get the admin to be deleted
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    // Cannot permanently delete super admins
    if (admin.role === "super_admin") {
      throw new ConvexError("Cannot permanently delete super admin accounts");
    }

    // Must be soft-deleted first
    if (!admin.isDeleted) {
      throw new ConvexError(
        "Admin must be soft-deleted first before permanent deletion"
      );
    }

    // Get admin's department to clean up related data
    const department = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("createdBy"), args.adminId))
      .first();

    if (department) {
      // Get all events created by this admin
      const events = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("createdBy"), args.adminId))
        .collect();

      // Delete all related data for each event
      for (const event of events) {
        // Delete votes for this event
        const votes = await ctx.db
          .query("votes")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const vote of votes) {
          await ctx.db.delete(vote._id);
        }

        // Delete nominees in categories for this event
        const categories = await ctx.db
          .query("categories")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const category of categories) {
          const nominees = await ctx.db
            .query("nominees")
            .withIndex("by_category", (q) => q.eq("categoryId", category._id))
            .collect();
          for (const nominee of nominees) {
            await ctx.db.delete(nominee._id);
          }
          await ctx.db.delete(category._id);
        }

        // Delete tickets for this event
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const ticket of tickets) {
          await ctx.db.delete(ticket._id);
        }

        // Delete ticket types for this event
        const ticketTypes = await ctx.db
          .query("ticketTypes")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const ticketType of ticketTypes) {
          await ctx.db.delete(ticketType._id);
        }

        // Delete nomination campaigns for this event
        const campaigns = await ctx.db
          .query("nominationCampaigns")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const campaign of campaigns) {
          // Delete nomination categories and user nominations
          const nomCategories = await ctx.db
            .query("nominationCategories")
            .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
            .collect();
          for (const nomCategory of nomCategories) {
            const userNominations = await ctx.db
              .query("userNominations")
              .filter((q) => q.eq(q.field("categoryId"), nomCategory._id))
              .collect();
            for (const userNom of userNominations) {
              await ctx.db.delete(userNom._id);
            }
            await ctx.db.delete(nomCategory._id);
          }
          await ctx.db.delete(campaign._id);
        }

        // Delete the event
        await ctx.db.delete(event._id);
      }

      // Delete department last
      await ctx.db.delete(department._id);
    }

    // Finally delete the admin account
    await ctx.db.delete(args.adminId);

    return { success: true };
  },
});
