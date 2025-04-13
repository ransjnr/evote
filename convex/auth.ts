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

    // Hash password using our simple hash function
    const passwordHash = simpleHash(args.password);

    // Insert the new admin
    const adminId = await ctx.db.insert("admins", {
      email: args.email,
      passwordHash,
      name: args.name,
      departmentId: args.departmentId,
      role: args.role,
      createdAt: Date.now(),
    });

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

    // Return user data (excluding password hash)
    return {
      success: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        departmentId: admin.departmentId,
        role: admin.role,
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

    // Return admin data without password hash
    return {
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      departmentId: admin.departmentId,
      role: admin.role,
    };
  },
});

// Check if email exists
export const checkEmailExists = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return !!admin;
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
