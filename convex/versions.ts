import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { FullModeSchema } from "./types";
import { hasModeratorAccess } from "./users";

// Helper function to parse version numbers
const parseVersion = (version: string) => {
  const parts = version.replace(/^v/, "").split(".").map(Number);
  return parts.every((n) => !isNaN(n)) ? parts : [0];
};

export const getModeVersions = query({
  args: {
    name: v.string(),
  },
  returns: v.array(FullModeSchema),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    let user = null;
    if (userId) {
      user = await ctx.db.get(userId);
    }
    const hasModerator = hasModeratorAccess(user?.role);

    // Find all versions of this mode by name using index
    const versions = await ctx.db
      .query("modes")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .collect();

    // Filter by status - non-moderators only see approved modes
    const filteredVersions = hasModerator
      ? versions
      : versions.filter((mode) => mode.status === "approved");

    // Sort by version (assuming semantic versioning or chronological order)
    filteredVersions.sort((a, b) => {
      const aVersion = parseVersion(a.version);
      const bVersion = parseVersion(b.version);

      // Compare version parts
      for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
        const aPart = aVersion[i] || 0;
        const bPart = bVersion[i] || 0;
        if (aPart !== bPart) {
          return aPart - bPart; // Ascending order (oldest first, newest on right)
        }
      }

      // If versions are equal, sort by creation time (oldest first)
      return a._creationTime - b._creationTime;
    });

    return filteredVersions;
  },
});
