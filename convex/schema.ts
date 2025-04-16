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
    isVerified: v.boolean(),
    verifiedBy: v.optional(v.id("admins")),
    verifiedAt: v.optional(v.number()),
    revokedBy: v.optional(v.id("admins")),
    revokedAt: v.optional(v.number()),
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
    // Ticket-related fields
    hasTicketing: v.optional(v.boolean()),
    location: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    ticketSalesStartDate: v.optional(v.number()),
    ticketSalesEndDate: v.optional(v.number()),
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
    code: v.string(),
    createdBy: v.id("admins"),
    createdAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_code", ["code"]),

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

  // Ticket types table
  ticket_types: defineTable({
    name: v.string(), // e.g., "VIP", "Regular", "Early Bird"
    eventId: v.id("events"),
    price: v.number(),
    capacity: v.number(),
    remainingCapacity: v.number(),
    benefits: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("admins"),
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  // Ticket reservations table
  ticket_reservations: defineTable({
    ticketTypeId: v.id("ticket_types"),
    eventId: v.id("events"),
    quantity: v.number(),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.string(),
    isPaid: v.boolean(),
    paymentMethod: v.optional(v.string()),
    transactionId: v.optional(v.string()),
    isCheckedIn: v.boolean(),
    ticketCode: v.string(),
    qrCodeUrl: v.optional(v.string()),
    checkedInAt: v.optional(v.number()),
    ticketSentEmail: v.boolean(),
    ticketSentSms: v.boolean(),
    totalAmount: v.number(),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_ticket_type", ["ticketTypeId"])
    .index("by_ticket_code", ["ticketCode"])
    .index("by_buyer_email", ["buyerEmail"])
    .index("by_transaction", ["transactionId"]),

  // Check-in log table
  check_in_logs: defineTable({
    reservationId: v.id("ticket_reservations"),
    eventId: v.id("events"),
    ticketCode: v.string(),
    scannedBy: v.id("admins"),
    scannedAt: v.number(),
    status: v.union(
      v.literal("success"),
      v.literal("already_checked_in"),
      v.literal("invalid_ticket"),
      v.literal("wrong_event")
    ),
  }).index("by_event", ["eventId"]),

  // Ticket QR codes table
  ticket_qrcodes: defineTable({
    reservationId: v.id("ticket_reservations"),
    qrCodeData: v.string(), // JSON stringified data
    createdAt: v.string(),
  }).index("by_reservation_id", ["reservationId"]),
});
