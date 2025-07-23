import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==== NOMINATION CAMPAIGNS ====

export const createNominationCampaign = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    departmentId: v.id("departments"),
    type: v.union(
      v.literal("awards"),
      v.literal("voting"),
      v.literal("event_portfolio")
    ),
    startDate: v.number(),
    endDate: v.number(),
    maxNominationsPerUser: v.optional(v.number()),
    allowSelfNomination: v.boolean(),
    createdBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Generate slug from name
    const baseSlug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let i = 1;
    // Ensure uniqueness
    while (
      await ctx.db
        .query("nominationCampaigns")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first()
    ) {
      slug = `${baseSlug}-${i++}`;
    }
    const campaignId = await ctx.db.insert("nominationCampaigns", {
      ...args,
      slug,
      isActive: true,
      createdAt: Date.now(),
    });
    return { success: true, campaignId, slug };
  },
});

export const listNominationCampaigns = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    type: v.optional(
      v.union(
        v.literal("awards"),
        v.literal("voting"),
        v.literal("event_portfolio")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("nominationCampaigns");

    if (args.departmentId) {
      query = query.filter((q) =>
        q.eq(q.field("departmentId"), args.departmentId)
      );
    }

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const campaigns = await query.order("desc").collect();

    // Get associated events for campaigns that have them
    const campaignsWithEvents = await Promise.all(
      campaigns.map(async (campaign) => {
        let event = null;
        if (campaign.eventId) {
          event = await ctx.db.get(campaign.eventId);
        }

        // Get department info
        const department = await ctx.db.get(campaign.departmentId);

        // Get categories count
        const categoriesCount = await ctx.db
          .query("nominationCategories")
          .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
          .collect();

        // Get nominations count
        const nominationsCount = await ctx.db
          .query("userNominations")
          .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
          .collect();

        return {
          ...campaign,
          event,
          department,
          categoriesCount: categoriesCount.length,
          nominationsCount: nominationsCount.length,
        };
      })
    );

    return campaignsWithEvents;
  },
});

export const getNominationCampaign = query({
  args: { campaignId: v.id("nominationCampaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return null;

    // Get associated event
    let event = null;
    if (campaign.eventId) {
      event = await ctx.db.get(campaign.eventId);
    }

    // Get department
    const department = await ctx.db.get(campaign.departmentId);

    // Get categories
    const categories = await ctx.db
      .query("nominationCategories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
      .collect();

    return {
      ...campaign,
      event,
      department,
      categories,
    };
  },
});

export const updateNominationCampaign = mutation({
  args: {
    campaignId: v.id("nominationCampaigns"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    maxNominationsPerUser: v.optional(v.number()),
    allowSelfNomination: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { campaignId, ...updates } = args;

    await ctx.db.patch(campaignId, updates);

    return { success: true };
  },
});

export const deleteNominationCampaign = mutation({
  args: { campaignId: v.id("nominationCampaigns") },
  handler: async (ctx, args) => {
    // Delete all categories and nominations for this campaign
    const categories = await ctx.db
      .query("nominationCategories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const nominations = await ctx.db
      .query("userNominations")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // Delete nominations first
    for (const nomination of nominations) {
      await ctx.db.delete(nomination._id);
    }

    // Delete categories
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    // Delete campaign
    await ctx.db.delete(args.campaignId);

    return { success: true };
  },
});

// ==== NOMINATION CATEGORIES ====

export const createNominationCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    campaignId: v.id("nominationCampaigns"),
    requirements: v.optional(v.array(v.string())),
    createdBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("nominationCategories", {
      ...args,
      createdAt: Date.now(),
    });

    return { success: true, categoryId };
  },
});

export const getNominationCategories = query({
  args: { campaignId: v.id("nominationCampaigns") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("nominationCategories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // Get nomination count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const nominationsCount = await ctx.db
          .query("userNominations")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();

        return {
          ...category,
          nominationsCount: nominationsCount.length,
        };
      })
    );

    return categoriesWithCounts;
  },
});

export const updateNominationCategory = mutation({
  args: {
    categoryId: v.id("nominationCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updates } = args;

    await ctx.db.patch(categoryId, updates);

    return { success: true };
  },
});

export const deleteNominationCategory = mutation({
  args: { categoryId: v.id("nominationCategories") },
  handler: async (ctx, args) => {
    // Delete all nominations for this category
    const nominations = await ctx.db
      .query("userNominations")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const nomination of nominations) {
      await ctx.db.delete(nomination._id);
    }

    // Delete category
    await ctx.db.delete(args.categoryId);

    return { success: true };
  },
});

// ==== USER NOMINATIONS ====

export const submitNomination = mutation({
  args: {
    campaignId: v.id("nominationCampaigns"),
    categoryId: v.id("nominationCategories"),
    nomineeName: v.string(),
    nomineeEmail: v.optional(v.string()),
    nomineePhone: v.optional(v.string()),
    nomineeDescription: v.string(),
    nominatorName: v.string(),
    nominatorEmail: v.string(),
    nominatorPhone: v.optional(v.string()),
    supportingDocuments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check if campaign is active and within date range
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const now = Date.now();
    if (
      !campaign.isActive ||
      now < campaign.startDate ||
      now > campaign.endDate
    ) {
      throw new Error("Campaign is not currently accepting nominations");
    }

    // Check nomination limits
    if (campaign.maxNominationsPerUser) {
      const existingNominations = await ctx.db
        .query("userNominations")
        .withIndex("by_nominator_email", (q) =>
          q.eq("nominatorEmail", args.nominatorEmail)
        )
        .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
        .collect();

      if (existingNominations.length >= campaign.maxNominationsPerUser) {
        throw new Error(
          `You can only submit ${campaign.maxNominationsPerUser} nominations for this campaign`
        );
      }
    }

    // Check self-nomination rules
    if (
      !campaign.allowSelfNomination &&
      args.nominatorEmail === args.nomineeEmail
    ) {
      throw new Error("Self-nomination is not allowed for this campaign");
    }

    const nominationId = await ctx.db.insert("userNominations", {
      ...args,
      status: "pending",
      createdAt: now,
    });

    return { success: true, nominationId };
  },
});

export const getUserNominations = query({
  args: {
    campaignId: v.optional(v.id("nominationCampaigns")),
    categoryId: v.optional(v.id("nominationCategories")),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("converted")
      )
    ),
    nominatorEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("userNominations");

    if (args.campaignId) {
      query = query.filter((q) => q.eq(q.field("campaignId"), args.campaignId));
    }

    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    if (args.nominatorEmail) {
      query = query.filter((q) =>
        q.eq(q.field("nominatorEmail"), args.nominatorEmail)
      );
    }

    const nominations = await query.order("desc").collect();

    // Get campaign and category info for each nomination
    const nominationsWithInfo = await Promise.all(
      nominations.map(async (nomination) => {
        const campaign = await ctx.db.get(nomination.campaignId);
        const category = await ctx.db.get(nomination.categoryId);

        let reviewedBy = null;
        if (nomination.reviewedBy) {
          reviewedBy = await ctx.db.get(nomination.reviewedBy);
        }

        return {
          ...nomination,
          campaign,
          category,
          reviewedBy,
        };
      })
    );

    return nominationsWithInfo;
  },
});

export const updateNomination = mutation({
  args: {
    nominationId: v.id("userNominations"),
    nomineeName: v.optional(v.string()),
    nomineeEmail: v.optional(v.string()),
    nomineeDescription: v.optional(v.string()),
    nominatorName: v.optional(v.string()),
    nominatorEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { nominationId, ...updates } = args;

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(nominationId, cleanUpdates);

    return { success: true };
  },
});

export const reviewNomination = mutation({
  args: {
    nominationId: v.id("userNominations"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    reviewComments: v.optional(v.string()),
    reviewedBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.nominationId, {
      status: args.status,
      reviewComments: args.reviewComments,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
    });

    return { success: true };
  },
});

export const convertNominationToNominee = mutation({
  args: {
    nominationId: v.id("userNominations"),
    categoryId: v.id("categories"), // Voting category to add nominee to
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    createdBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const nomination = await ctx.db.get(args.nominationId);
    if (!nomination) {
      throw new Error("Nomination not found");
    }

    if (nomination.status !== "approved") {
      throw new Error("Only approved nominations can be converted");
    }

    // Get the category to get the event and department for code generation
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    const event = await ctx.db.get(category.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const department = await ctx.db.get(event.departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    // Generate abbreviation from department name
    const generateAbbreviation = (name: string): string => {
      return name
        .split(/\s+/) // Split by whitespace
        .map((word) => word.charAt(0).toUpperCase()) // Get first char of each word, uppercase
        .join(""); // Join them together
    };

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

    // Create nominee in voting system
    const nomineeId = await ctx.db.insert("nominees", {
      name: nomination.nomineeName,
      description: nomination.nomineeDescription,
      imageUrl: args.imageUrl,
      videoUrl: args.videoUrl,
      categoryId: args.categoryId,
      code: finalCode,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });

    // Update nomination status
    await ctx.db.patch(args.nominationId, {
      status: "converted",
    });

    return { success: true, nomineeId, code: finalCode };
  },
});

// ==== PUBLIC QUERIES FOR USER-FACING PAGES ====

export const getActiveCampaigns = query({
  args: {
    type: v.optional(
      v.union(
        v.literal("awards"),
        v.literal("voting"),
        v.literal("event_portfolio")
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    let query = ctx.db
      .query("nominationCampaigns")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.lte(q.field("startDate"), now))
      .filter((q) => q.gte(q.field("endDate"), now));

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const campaigns = await query.collect();

    // Filter out campaigns created by deleted admins
    const activeCampaigns = [];

    for (const campaign of campaigns) {
      const createdByAdmin = await ctx.db.get(campaign.createdBy);
      if (createdByAdmin && !createdByAdmin.isDeleted) {
        // Also check if department was created by a non-deleted admin
        const department = await ctx.db.get(campaign.departmentId);
        if (department) {
          const deptCreatedByAdmin = await ctx.db.get(department.createdBy);
          if (deptCreatedByAdmin && !deptCreatedByAdmin.isDeleted) {
            // Get categories for this campaign
            const categories = await ctx.db
              .query("nominationCategories")
              .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
              .collect();

            // Filter categories created by non-deleted admins
            const activeCategories = [];
            for (const category of categories) {
              const categoryCreatedByAdmin = await ctx.db.get(
                category.createdBy
              );
              if (categoryCreatedByAdmin && !categoryCreatedByAdmin.isDeleted) {
                activeCategories.push(category);
              }
            }

            activeCampaigns.push({
              ...campaign,
              categories: activeCategories,
              department,
            });
          }
        }
      }
    }

    return activeCampaigns;
  },
});

// Get a single nomination campaign by slug
export const getNominationCampaignBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const campaign = await ctx.db
      .query("nominationCampaigns")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!campaign) return null;
    // Get associated event
    let event = null;
    if (campaign.eventId) {
      event = await ctx.db.get(campaign.eventId);
    }
    // Get department
    const department = await ctx.db.get(campaign.departmentId);
    // Get categories
    const categories = await ctx.db
      .query("nominationCategories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
      .collect();
    return {
      ...campaign,
      event,
      department,
      categories,
    };
  },
});

// Update getPublicNominationCampaign to use slug
export const getPublicNominationCampaign = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const campaign = await ctx.db
      .query("nominationCampaigns")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!campaign) {
      return null;
    }
    // Check if campaign is publicly accessible
    const createdByAdmin = await ctx.db.get(campaign.createdBy);
    if (!createdByAdmin || createdByAdmin.isDeleted) {
      return null;
    }
    // Check if department is accessible
    const department = await ctx.db.get(campaign.departmentId);
    if (!department) {
      return null;
    }
    const deptCreatedByAdmin = await ctx.db.get(department.createdBy);
    if (!deptCreatedByAdmin || deptCreatedByAdmin.isDeleted) {
      return null;
    }
    // Get categories for this campaign
    const categories = await ctx.db
      .query("nominationCategories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
      .collect();
    // Filter categories created by non-deleted admins
    const activeCategories = [];
    for (const category of categories) {
      const categoryCreatedByAdmin = await ctx.db.get(category.createdBy);
      if (categoryCreatedByAdmin && !categoryCreatedByAdmin.isDeleted) {
        activeCategories.push(category);
      }
    }
    // Get event details if campaign is linked to an event
    let event = null;
    if (campaign.eventId) {
      event = await ctx.db.get(campaign.eventId);
    }
    return {
      ...campaign,
      categories: activeCategories,
      department,
      event,
    };
  },
});
