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
    isDeleted: v.optional(v.boolean()),
    deletedBy: v.optional(v.id("admins")),
    deletedAt: v.optional(v.number()),
    restoredBy: v.optional(v.id("admins")),
    restoredAt: v.optional(v.number()),
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
    votePrice: v.optional(v.number()), // Made optional since not all events have voting
    isActive: v.boolean(),
    createdBy: v.id("admins"),
    createdAt: v.number(),
    eventType: v.union(
      v.literal("voting_only"),
      v.literal("ticketing_only"),
      v.literal("voting_and_ticketing")
    ),
    venue: v.optional(v.string()),
    maxAttendees: v.optional(v.number()),
  }).index("by_department", ["departmentId"]),

  // Ticket types table
  ticketTypes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    eventId: v.id("events"),
    price: v.number(),
    quantity: v.number(), // Total available tickets of this type
    remaining: v.number(), // Remaining tickets of this type
    benefits: v.optional(v.array(v.string())), // Array of benefits included with this ticket
    createdBy: v.id("admins"),
    createdAt: v.number(),
    saleStartDate: v.optional(v.number()), // Optional start date for ticket sales
    saleEndDate: v.optional(v.number()), // Optional end date for ticket sales
  }).index("by_event", ["eventId"]),

  // Tickets table (purchased tickets)
  tickets: defineTable({
    ticketTypeId: v.id("ticketTypes"),
    eventId: v.id("events"),
    purchaserName: v.string(),
    purchaserEmail: v.string(),
    purchaserPhone: v.string(),
    transactionId: v.string(),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("used")
    ),
    ticketCode: v.string(), // Unique code for ticket validation
    createdAt: v.number(),
    usedAt: v.optional(v.number()), // Timestamp when ticket was used
    additionalDetails: v.optional(
      v.object({
        // Additional attendee details if needed
        age: v.optional(v.number()),
        gender: v.optional(v.string()),
        specialRequirements: v.optional(v.string()),
      })
    ),
  })
    .index("by_event", ["eventId"])
    .index("by_ticket_type", ["ticketTypeId"])
    .index("by_transaction", ["transactionId"])
    .index("by_ticket_code", ["ticketCode"]),

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

  // Vote sessions table
  voteSessions: defineTable({
    sessionId: v.string(),
    eventId: v.id("events"),
    votePrice: v.number(),
    nomineeCode: v.optional(v.string()),
    paymentReference: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    timestamp: v.optional(v.number()), // Keep for backward compatibility
  }).index("by_session", ["sessionId"]),

  // Nominations campaigns table - Admin creates these to open nominations
  nominationCampaigns: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    eventId: v.optional(v.id("events")), // Optional - can be for general awards not tied to specific events
    departmentId: v.id("departments"),
    type: v.union(
      v.literal("awards"), // For award nominations
      v.literal("voting"), // For voting portfolio nominations
      v.literal("event_portfolio") // For event management portfolio nominations
    ),
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    maxNominationsPerUser: v.optional(v.number()), // Limit how many people a user can nominate
    allowSelfNomination: v.boolean(),
    createdBy: v.id("admins"),
    createdAt: v.number(),
  })
    .index("by_department", ["departmentId"])
    .index("by_event", ["eventId"])
    .index("by_type", ["type"]),

  // Nomination categories - What people can be nominated for
  nominationCategories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    campaignId: v.id("nominationCampaigns"),
    requirements: v.optional(v.array(v.string())), // List of requirements for nominees
    createdBy: v.id("admins"),
    createdAt: v.number(),
  }).index("by_campaign", ["campaignId"]),

  // User nominations - Actual nominations submitted by users
  userNominations: defineTable({
    campaignId: v.id("nominationCampaigns"),
    categoryId: v.id("nominationCategories"),
    nomineeName: v.string(),
    nomineeEmail: v.optional(v.string()),
    nomineePhone: v.optional(v.string()),
    nomineeDescription: v.string(), // Why they're being nominated
    nominatorName: v.string(),
    nominatorEmail: v.string(),
    nominatorPhone: v.optional(v.string()),
    supportingDocuments: v.optional(v.array(v.string())), // URLs to uploaded documents
    status: v.union(
      v.literal("pending"), // Submitted but not reviewed
      v.literal("approved"), // Approved by admin
      v.literal("rejected"), // Rejected by admin
      v.literal("converted") // Converted to actual nominee for voting
    ),
    reviewedBy: v.optional(v.id("admins")),
    reviewedAt: v.optional(v.number()),
    reviewComments: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["status"])
    .index("by_nominator_email", ["nominatorEmail"]),

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
    paymentType: v.union(v.literal("vote"), v.literal("ticket")), // Added to distinguish between vote and ticket payments
    ticketTypeId: v.optional(v.id("ticketTypes")), // Reference to ticket type if payment is for tickets
    // USSD-specific fields
    phoneNumber: v.optional(v.string()), // Voter's phone number
    nomineeId: v.optional(v.id("nominees")), // Reference to the nominee voted for
    createdAt: v.number(),
  })
    .index("by_transaction", ["transactionId"])
    .index("by_event", ["eventId"]),

  // System settings table - Global configuration settings
  systemSettings: defineTable({
    key: v.string(), // Unique setting key
    value: v.any(), // Setting value (can be string, number, boolean, object)
    description: v.optional(v.string()), // Description of what this setting controls
    category: v.string(), // Category for grouping settings (e.g., "email", "payment", "voting")
    isPublic: v.boolean(), // Whether this setting can be viewed by non-super admins
    lastModifiedBy: v.id("admins"),
    lastModifiedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"]),
});
