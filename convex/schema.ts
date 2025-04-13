import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Admin users table
  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    departmentId: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("department_admin")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Departments table
  departments: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.string(),
    createdBy: v.id("admins"),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  // Events table
  events: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    departmentId: v.id("departments"),
    startDate: v.number(),
    endDate: v.number(),
    votePrice: v.number(),
    isActive: v.boolean(),
    createdBy: v.id("admins"),
    createdAt: v.number(),
  }).index("by_department", ["departmentId"]),

  // Categories table
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    eventId: v.id("events"),
    type: v.union(v.literal("popular_vote"), v.literal("judge_vote")),
    createdBy: v.id("admins"),
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  // Nominees table
  nominees: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    categoryId: v.id("categories"),
    createdBy: v.id("admins"),
    createdAt: v.number(),
  }).index("by_category", ["categoryId"]),

  // Votes table
  votes: defineTable({
    nomineeId: v.id("nominees"),
    categoryId: v.id("categories"),
    eventId: v.id("events"),
    transactionId: v.string(),
    amount: v.number(),
    createdAt: v.number(),
  })
    .index("by_nominee", ["nomineeId"])
    .index("by_category", ["categoryId"])
    .index("by_event", ["eventId"])
    .index("by_transaction", ["transactionId"]),

  // Payments table
  payments: defineTable({
    transactionId: v.string(),
    amount: v.number(),
    voteCount: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed")
    ),
    eventId: v.id("events"),
    paymentReference: v.string(),
    createdAt: v.number(),
  })
    .index("by_transaction", ["transactionId"])
    .index("by_event", ["eventId"]),
});
