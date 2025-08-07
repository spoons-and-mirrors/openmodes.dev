import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { hasModeratorAccess } from "./users";

/**
 * Clean up rejected modes older than specified days
 * Only admins can run this cleanup
 */
export const cleanupRejectedModes = mutation({
  args: {
    olderThanDays: v.optional(v.number()), // Default to 30 days
  },
  returns: v.object({
    deletedCount: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to run cleanup");
    }

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") {
      throw new Error("Only admins can run cleanup operations");
    }

    const daysThreshold = args.olderThanDays ?? 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
    const cutoffTimestamp = cutoffDate.getTime();

    // Find all rejected modes older than the threshold
    const rejectedModes = await ctx.db
      .query("modes")
      .withIndex("by_status", (q) => q.eq("status", "rejected"))
      .filter((q) => q.lt(q.field("_creationTime"), cutoffTimestamp))
      .collect();

    // Delete each rejected mode
    let deletedCount = 0;
    for (const mode of rejectedModes) {
      await ctx.db.delete(mode._id);
      deletedCount++;
    }

    return {
      deletedCount,
      message: `Cleaned up ${deletedCount} rejected modes older than ${daysThreshold} days`,
    };
  },
});

/**
 * Get stats about rejected modes for admin dashboard
 */
export const getRejectedModeStats = mutation({
  args: {},
  returns: v.object({
    totalRejected: v.number(),
    rejectedLast30Days: v.number(),
    rejectedOlderThan30Days: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!hasModeratorAccess(user?.role)) {
      throw new Error("Must be a moderator to view stats");
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysTimestamp = thirtyDaysAgo.getTime();

    const allRejected = await ctx.db
      .query("modes")
      .withIndex("by_status", (q) => q.eq("status", "rejected"))
      .collect();

    const rejectedLast30Days = allRejected.filter(
      (mode) => mode._creationTime >= thirtyDaysTimestamp,
    ).length;

    const rejectedOlderThan30Days = allRejected.filter(
      (mode) => mode._creationTime < thirtyDaysTimestamp,
    ).length;

    return {
      totalRejected: allRejected.length,
      rejectedLast30Days,
      rejectedOlderThan30Days,
    };
  },
});
