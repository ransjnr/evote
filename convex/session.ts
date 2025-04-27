import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Store vote session data
export const storeVoteSession = mutation({
  args: {
    sessionId: v.string(),
    eventId: v.id("events"),
    votePrice: v.number(),
    nomineeCode: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("voteSessions", {
      sessionId: args.sessionId,
      eventId: args.eventId,
      votePrice: args.votePrice,
      nomineeCode: args.nomineeCode,
      paymentReference: "",
      createdAt: now,
      timestamp: now, // Keep for backward compatibility
    });
  },
});

// Get vote session data
export const getVoteSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("voteSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) return null;

    // Handle backward compatibility
    return {
      ...session,
      createdAt: session.createdAt || session.timestamp,
    };
  },
});

export const updateVoteSession = mutation({
  args: {
    sessionId: v.string(),
    voteCount: v.optional(v.number()),       // make optional so you can update only what's needed
    votePrice: v.optional(v.number()),
    nomineeCode: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    paymentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("voteSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    const updatePayload: Record<string, any> = {};

    if (args.voteCount !== undefined) updatePayload.voteCount = args.voteCount;
    if (args.votePrice !== undefined) updatePayload.votePrice = args.votePrice;
    if (args.nomineeCode !== undefined) updatePayload.nomineeCode = args.nomineeCode;
    if (args.eventId !== undefined) updatePayload.eventId = args.eventId;
    if (args.paymentReference !== undefined) updatePayload.paymentReference = args.paymentReference;

    return await ctx.db.patch(session._id, updatePayload);
  },
});


export const markPaymentAsComplete = mutation({
  args: {
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("voteSessions")
      .withIndex("by_reference", (q) => q.eq("paymentReference", args.paymentReference))
      .first();

    if (!session) throw new Error("Session not found for reference");

    return await ctx.db.patch(session._id, {
      paymentStatus: "paid", // Add this field to your schema
    });
  },
});
