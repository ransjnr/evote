import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const storeVoteSession = mutation({
  args: {
    sessionId: v.string(),
    eventId: v.id("events"),
    votePrice: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("voteSessions", {
      sessionId: args.sessionId,
      eventId: args.eventId,
      votePrice: args.votePrice,
      timestamp: Date.now(),
    });
  },
});

// Get vote session by sessionId (for USSD integration)
export const getVoteSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("voteSessions")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    return {
      eventId: session.eventId,
      votePrice: session.votePrice,
    };
  },
});
