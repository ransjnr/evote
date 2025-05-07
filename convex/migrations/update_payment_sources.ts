import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Migration to update payment sources
export const updatePaymentSources = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all payments without a source
    const payments = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("source"), undefined))
      .collect();

    console.log(`Found ${payments.length} payments to update`);

    // Update each payment
    for (const payment of payments) {
      // If it has a phone number, it's a USSD payment
      // Otherwise, it's an app payment
      const source = payment.phoneNumber ? "ussd" : "app";

      await ctx.db.patch(payment._id, {
        source,
      });

      console.log(`Updated payment ${payment.transactionId} with source ${source}`);
    }

    return { success: true, updatedCount: payments.length };
  },
}); 