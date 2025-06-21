import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get all system settings (super admin only)
export const getAllSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("systemSettings")
      .order("asc")
      .collect();

    // Group settings by category
    const groupedSettings = settings.reduce(
      (acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
      },
      {} as Record<string, any[]>
    );

    return groupedSettings;
  },
});

// Get settings by category
export const getSettingsByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("systemSettings")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();

    return settings;
  },
});

// Get a specific setting by key
export const getSetting = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    return setting;
  },
});

// Get public settings (for non-super admins)
export const getPublicSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("systemSettings")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    return settings;
  },
});

// Create or update a system setting (super admin only)
export const setSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    category: v.string(),
    isPublic: v.boolean(),
    superAdminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Verify super admin privileges
    const superAdmin = await ctx.db.get(args.superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      throw new ConvexError(
        "Unauthorized: Only super admins can modify system settings"
      );
    }

    // Check if setting already exists
    const existingSetting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    const now = Date.now();

    if (existingSetting) {
      // Update existing setting
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        description: args.description,
        category: args.category,
        isPublic: args.isPublic,
        lastModifiedBy: args.superAdminId,
        lastModifiedAt: now,
      });

      return { success: true, action: "updated" };
    } else {
      // Create new setting
      await ctx.db.insert("systemSettings", {
        key: args.key,
        value: args.value,
        description: args.description,
        category: args.category,
        isPublic: args.isPublic,
        lastModifiedBy: args.superAdminId,
        lastModifiedAt: now,
        createdAt: now,
      });

      return { success: true, action: "created" };
    }
  },
});

// Delete a system setting (super admin only)
export const deleteSetting = mutation({
  args: {
    settingId: v.id("systemSettings"),
    superAdminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Verify super admin privileges
    const superAdmin = await ctx.db.get(args.superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      throw new ConvexError(
        "Unauthorized: Only super admins can delete system settings"
      );
    }

    const setting = await ctx.db.get(args.settingId);
    if (!setting) {
      throw new ConvexError("Setting not found");
    }

    await ctx.db.delete(args.settingId);

    return { success: true };
  },
});

// Initialize default system settings
export const initializeDefaultSettings = mutation({
  args: {
    superAdminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Verify super admin privileges
    const superAdmin = await ctx.db.get(args.superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      throw new ConvexError(
        "Unauthorized: Only super admins can initialize settings"
      );
    }

    const now = Date.now();

    const defaultSettings = [
      // General Settings
      {
        key: "app_name",
        value: "Pollix",
        description: "Application name displayed throughout the system",
        category: "general",
        isPublic: true,
      },
      {
        key: "app_description",
        value: "Digital Voting and Event Management Platform",
        description: "Brief description of the application",
        category: "general",
        isPublic: true,
      },
      {
        key: "contact_email",
        value: "admin@pollix.com",
        description: "Main contact email for the platform",
        category: "general",
        isPublic: true,
      },
      {
        key: "support_phone",
        value: "+233 XXX XXX XXX",
        description: "Support phone number",
        category: "general",
        isPublic: true,
      },

      // Voting Settings
      {
        key: "default_vote_price",
        value: 1.0,
        description: "Default price per vote in GHS",
        category: "voting",
        isPublic: false,
      },
      {
        key: "minimum_vote_price",
        value: 0.5,
        description: "Minimum allowed vote price in GHS",
        category: "voting",
        isPublic: false,
      },
      {
        key: "maximum_vote_price",
        value: 50.0,
        description: "Maximum allowed vote price in GHS",
        category: "voting",
        isPublic: false,
      },
      {
        key: "max_votes_per_transaction",
        value: 100,
        description: "Maximum number of votes allowed in a single transaction",
        category: "voting",
        isPublic: false,
      },

      // Payment Settings
      {
        key: "paystack_public_key",
        value: "",
        description: "Paystack public key for payment processing",
        category: "payment",
        isPublic: false,
      },
      {
        key: "paystack_secret_key",
        value: "",
        description: "Paystack secret key for payment processing",
        category: "payment",
        isPublic: false,
      },
      {
        key: "commission_rate",
        value: 0.1,
        description: "Platform commission rate (10%)",
        category: "payment",
        isPublic: false,
      },

      // Email Settings
      {
        key: "smtp_host",
        value: "",
        description: "SMTP server host for sending emails",
        category: "email",
        isPublic: false,
      },
      {
        key: "smtp_port",
        value: 587,
        description: "SMTP server port",
        category: "email",
        isPublic: false,
      },
      {
        key: "smtp_username",
        value: "",
        description: "SMTP username",
        category: "email",
        isPublic: false,
      },
      {
        key: "smtp_password",
        value: "",
        description: "SMTP password",
        category: "email",
        isPublic: false,
      },

      // Features Settings
      {
        key: "registration_enabled",
        value: true,
        description: "Whether new admin registration is enabled",
        category: "features",
        isPublic: true,
      },
      {
        key: "maintenance_mode",
        value: false,
        description: "Whether the system is in maintenance mode",
        category: "features",
        isPublic: true,
      },
      {
        key: "max_file_upload_size",
        value: 5,
        description: "Maximum file upload size in MB",
        category: "features",
        isPublic: false,
      },
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const setting of defaultSettings) {
      const existing = await ctx.db
        .query("systemSettings")
        .withIndex("by_key", (q) => q.eq("key", setting.key))
        .first();

      if (!existing) {
        await ctx.db.insert("systemSettings", {
          ...setting,
          lastModifiedBy: args.superAdminId,
          lastModifiedAt: now,
          createdAt: now,
        });
        createdCount++;
      } else {
        existingCount++;
      }
    }

    return {
      success: true,
      message: `Initialized ${createdCount} new settings. ${existingCount} settings already existed.`,
      createdCount,
      existingCount,
    };
  },
});

// Get system statistics for dashboard
export const getSystemStats = query({
  args: {},
  handler: async (ctx) => {
    // Get counts of various entities
    const [
      totalAdmins,
      totalDepartments,
      totalEvents,
      totalVotes,
      totalTickets,
      totalSettings,
    ] = await Promise.all([
      ctx.db.query("admins").collect(),
      ctx.db.query("departments").collect(),
      ctx.db.query("events").collect(),
      ctx.db.query("votes").collect(),
      ctx.db.query("tickets").collect(),
      ctx.db.query("systemSettings").collect(),
    ]);

    // Active counts
    const activeAdmins = totalAdmins.filter((admin) => !admin.isDeleted);
    const activeEvents = totalEvents.filter((event) => event.isActive);
    const confirmedTickets = totalTickets.filter(
      (ticket) => ticket.status === "confirmed"
    );

    return {
      totalAdmins: totalAdmins.length,
      activeAdmins: activeAdmins.length,
      totalDepartments: totalDepartments.length,
      totalEvents: totalEvents.length,
      activeEvents: activeEvents.length,
      totalVotes: totalVotes.length,
      totalTickets: totalTickets.length,
      confirmedTickets: confirmedTickets.length,
      totalSettings: totalSettings.length,
    };
  },
});
