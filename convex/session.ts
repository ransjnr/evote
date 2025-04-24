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

// Update vote session with payment reference
export const updateVoteSession = mutation({
  args: {
    sessionId: v.string(),
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("voteSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    return await ctx.db.patch(session._id, {
      paymentReference: args.paymentReference,
    });
  },
});
