import { mutation } from "./_generated/server";
import { v } from "convex/values";

// A simple hash function for password (for development only)
// Copied from auth.ts to avoid circular imports
function simpleHash(password: string) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return (
    hash.toString() +
    "_" +
    password.length +
    "_" +
    Date.now().toString().substring(0, 8)
  );
}

// Generates an abbreviation from the department name (takes first letter of each word)
function generateAbbreviation(name: string): string {
  return name
    .split(/\s+/) // Split by whitespace
    .map((word) => word.charAt(0).toUpperCase()) // Get first char of each word, uppercase
    .join(""); // Join them together
}

/**
 * Migration to add isVerified field to all existing admin records
 *
 * This solves the schema validation error where existing admin records
 * don't have the required isVerified field after schema update.
 */
export const migrateAdminRecords = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all admin records
    const admins = await ctx.db.query("admins").collect();

    // Update counter to track progress
    let updatedCount = 0;

    // Process each admin record
    for (const admin of admins) {
      // Check if the record is missing the isVerified field
      if (admin.isVerified === undefined) {
        // Set superadmins to verified, regular admins to unverified by default
        const isVerified = admin.role === "super_admin" ? true : false;

        // Update the record with the missing field
        await ctx.db.patch(admin._id, {
          isVerified: isVerified,
        });

        updatedCount++;
      }
    }

    return {
      success: true,
      totalAdmins: admins.length,
      updatedAdmins: updatedCount,
      message: `Migration complete. Updated ${updatedCount} admin records.`,
    };
  },
});

/**
 * Migration to add a code field to all existing nominee records
 */
export const migrateNomineeRecords = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all nominee records without a code
    const nominees = await ctx.db.query("nominees").collect();

    // Keep track of department-specific code counters
    const departmentCodeCounters: Record<string, number> = {};
    // Keep track of generated codes to ensure uniqueness
    const generatedCodes: Set<string> = new Set();

    let updatedCount = 0;
    let skippedCount = 0;

    // Process each nominee
    for (const nominee of nominees) {
      try {
        // Skip if it already has a code
        if ("code" in nominee && nominee.code) {
          skippedCount++;
          continue;
        }

        // Get the category to determine the event
        const category = await ctx.db.get(nominee.categoryId);
        if (!category) {
          throw new Error(`Category not found for nominee ${nominee._id}`);
        }

        // Get the event to determine the department
        const event = await ctx.db.get(category.eventId);
        if (!event) {
          throw new Error(`Event not found for category ${category._id}`);
        }

        // Get the department to create the code prefix
        const department = await ctx.db.get(event.departmentId);
        if (!department) {
          throw new Error(`Department not found for event ${event._id}`);
        }

        // Generate abbreviation
        const deptAbbrev = generateAbbreviation(department.name);

        // Get or initialize counter for this department
        if (!departmentCodeCounters[deptAbbrev]) {
          departmentCodeCounters[deptAbbrev] = 1;
        }

        // Generate code
        let codeNum = departmentCodeCounters[deptAbbrev]
          .toString()
          .padStart(3, "0");
        let code = `${deptAbbrev}${codeNum}`;

        // Ensure uniqueness
        while (generatedCodes.has(code)) {
          departmentCodeCounters[deptAbbrev]++;
          codeNum = departmentCodeCounters[deptAbbrev]
            .toString()
            .padStart(3, "0");
          code = `${deptAbbrev}${codeNum}`;
        }

        // Save the code
        generatedCodes.add(code);
        departmentCodeCounters[deptAbbrev]++;

        // Update the nominee with the code
        await ctx.db.patch(nominee._id, { code });
        updatedCount++;
      } catch (error) {
        console.error(`Error processing nominee ${nominee._id}:`, error);
        // Continue with the next nominee
      }
    }

    return {
      success: true,
      totalNominees: nominees.length,
      updatedNominees: updatedCount,
      skippedNominees: skippedCount,
      message: `Migration complete. Generated codes for ${updatedCount} nominees. Skipped ${skippedCount} nominees.`,
    };
  },
});

/**
 * Create a superadmin account directly
 *
 * This function is useful when you need to create a fresh superadmin account,
 * especially after schema changes.
 */
export const createSuperAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingAdmin) {
      return {
        success: false,
        message: "Email already exists. Please use a different email address.",
      };
    }

    // Hash password
    const passwordHash = simpleHash(args.password);

    // Insert the new superadmin account
    const adminId = await ctx.db.insert("admins", {
      email: args.email,
      passwordHash,
      name: args.name,
      departmentId: "system",
      role: "super_admin",
      isVerified: true,
      createdAt: Date.now(),
    });

    return {
      success: true,
      message: "Super admin account created successfully!",
      adminId,
    };
  },
});

// Inside the migrateNomineeRecords function, update the filter implementation
// This is a simple utility function we'll add to help count department nominees
async function getNomineeCountForDepartment(ctx: any, deptAbbrev: string) {
  // Use proper Convex filter syntax - between prefix and prefix+max unicode char
  const nominees = await ctx.db
    .query("nominees")
    .filter(
      (q: any) =>
        q.gt(q.field("code"), deptAbbrev) &&
        q.lt(q.field("code"), deptAbbrev + "\uffff")
    )
    .collect();

  return nominees.length;
}

/**
 * Migration to update admin schema with revocation fields
 *
 * This solves the schema validation error with the revokeAdminVerification function
 */
export const updateAdminSchemaWithRevocation = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all admin records
    const admins = await ctx.db.query("admins").collect();
    let updatedCount = 0;

    // Process each admin record
    for (const admin of admins) {
      try {
        // Only update if the record doesn't have the new fields
        if (admin.revokedBy === undefined && admin.revokedAt === undefined) {
          // Just add the new fields with undefined values which will be handled as optional
          await ctx.db.patch(admin._id, {
            // These will be stored as undefined since they're optional fields
            revokedBy: admin.isVerified ? undefined : admin.verifiedBy,
            revokedAt: admin.isVerified ? undefined : admin.verifiedAt,
          });
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error updating admin ${admin._id}:`, error);
      }
    }

    return {
      success: true,
      totalAdmins: admins.length,
      updatedAdmins: updatedCount,
      message: `Migration complete. Updated ${updatedCount} admin records with revocation fields.`,
    };
  },
});
