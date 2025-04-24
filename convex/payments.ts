import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all USSD transactions with nominee details
export const getUSSDTransactions = query({
  args: {},
  handler: async (ctx) => {
    // Get all payments that have a phone number (USSD transactions)
    const transactions = await ctx.db
      .query("payments")
      .filter((q) => q.neq(q.field("phoneNumber"), undefined))
      .collect();

    // Get nominee details for each transaction
    const transactionsWithNominees = await Promise.all(
      transactions.map(async (transaction) => {
        if (!transaction.nomineeId) return transaction;

        const nominee = await ctx.db.get(transaction.nomineeId);
        return {
          ...transaction,
          nominee: nominee
            ? {
                name: nominee.name,
                code: nominee.code,
              }
            : null,
        };
      })
    );

    // Sort by creation date (newest first)
    return transactionsWithNominees.sort(
      (a, b) => b.createdAt - a.createdAt
    );
  },
}); 