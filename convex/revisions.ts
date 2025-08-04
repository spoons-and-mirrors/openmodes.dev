import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import {
  InstructionSchema,
  McpToolSchema,
  ModeRevisionSchema,
  SimpleModeRevisionSchema,
  OriginalModeSchema,
} from "./types";
import { hasModeratorAccess } from "./users";

// Create a revision (edit proposal)
export const createRevision = mutation({
  args: {
    original_mode_id: v.id("modes"),
    name: v.string(),
    description: v.string(),
    prompt: v.string(),
    instructions: v.optional(v.array(InstructionSchema)),
    mcp_tools: v.optional(v.array(McpToolSchema)),
    tools: v.optional(v.record(v.string(), v.boolean())),
    change_summary: v.string(),
    parent_version: v.string(),
  },
  returns: v.object({ revisionId: v.id("mode_revisions") }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create revision");
    }

    // Get the original mode to validate and generate next version
    const originalMode = await ctx.db.get(args.original_mode_id);
    if (!originalMode) {
      throw new Error("Original mode not found");
    }

    // Generate next version number
    const currentVersions = await ctx.db
      .query("modes")
      .withIndex("by_name_and_author", (q) =>
        q.eq("name", originalMode.name).eq("author", originalMode.author),
      )
      .collect();

    // Find the highest version number
    let highestVersion = [1, 0]; // Default to 1.0
    currentVersions.forEach((mode) => {
      const version = mode.version.replace(/^v/, "").split(".").map(Number);
      if (version.length >= 2 && version.every((n) => !isNaN(n))) {
        if (
          version[0] > highestVersion[0] ||
          (version[0] === highestVersion[0] && version[1] > highestVersion[1])
        ) {
          highestVersion = version;
        }
      }
    });

    // Increment minor version
    const proposedVersion = `${highestVersion[0]}.${highestVersion[1] + 1}`;

    const revisionId = await ctx.db.insert("mode_revisions", {
      original_mode_id: args.original_mode_id,
      author_id: userId,
      revision_type: "edit",
      name: args.name,
      description: args.description,
      prompt: args.prompt,
      instructions: args.instructions || [],
      tools: {
        mcp_tools: args.mcp_tools || [],
        tools: args.tools || {},
      },
      change_summary: args.change_summary,
      status: "pending",
      parent_version: args.parent_version,
      proposed_version: proposedVersion,
      created_at: new Date().toISOString(),
    });

    return { revisionId };
  },
});

// Get pending revisions for moderators
export const getPendingRevisions = query({
  args: {},
  returns: v.array(ModeRevisionSchema),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!hasModeratorAccess(user?.role)) {
      throw new Error("Must be a moderator to view pending revisions");
    }

    const pendingRevisions = await ctx.db
      .query("mode_revisions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Enrich with author and original mode data
    const enrichedRevisions = [];
    for (const revision of pendingRevisions) {
      const author = await ctx.db.get(revision.author_id);
      const originalMode = await ctx.db.get(revision.original_mode_id);

      enrichedRevisions.push({
        ...revision,
        author_name: author?.name || "Unknown",
        original_mode_name: originalMode?.name || "Unknown",
      });
    }

    return enrichedRevisions.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Approve or reject a revision
export const reviewRevision = mutation({
  args: {
    revisionId: v.id("mode_revisions"),
    action: v.union(v.literal("approve"), v.literal("reject")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to review revision");
    }

    const user = await ctx.db.get(userId);
    if (!hasModeratorAccess(user?.role)) {
      throw new Error("Must be a moderator to review revisions");
    }

    const revision = await ctx.db.get(args.revisionId);
    if (!revision) {
      throw new Error("Revision not found");
    }

    if (revision.status !== "pending") {
      throw new Error("Revision has already been reviewed");
    }

    if (args.action === "approve") {
      // Create new version of the mode
      const originalMode = await ctx.db.get(revision.original_mode_id);
      if (!originalMode) {
        throw new Error("Original mode not found");
      }

      // Set the original mode to non-canonical
      await ctx.db.patch(revision.original_mode_id, { is_canonical: false });

      const newModeId = await ctx.db.insert("modes", {
        name: revision.name,
        author: originalMode.author, // Keep original author
        description: revision.description,
        prompt: revision.prompt,
        instructions: revision.instructions,
        tools: revision.tools,
        version: revision.proposed_version,
        status: "approved",
        downloads: 0,
        votes: 0,
        updated_at: new Date().toISOString(),
        is_canonical: true, // This becomes the new canonical version
        revision_id: args.revisionId,
      });

      console.log("Created new mode version:", newModeId);

      // Update the revision status
      await ctx.db.patch(args.revisionId, { status: "approved" });
    } else {
      // Reject the revision
      await ctx.db.patch(args.revisionId, { status: "rejected" });
    }

    return null;
  },
});

// Get pending revision count for moderators
export const getPendingRevisionCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const user = await ctx.db.get(userId);
    if (!hasModeratorAccess(user?.role)) return 0;

    const pendingRevisions = await ctx.db
      .query("mode_revisions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return pendingRevisions.length;
  },
});

// Get combined pending count (modes + revisions) for moderators
export const getPendingCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const user = await ctx.db.get(userId);
    if (!hasModeratorAccess(user?.role)) return 0;

    // Get pending revisions
    const pendingRevisions = await ctx.db
      .query("mode_revisions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Get pending modes
    const allModes = await ctx.db
      .query("modes")
      .withIndex("by_canonical", (q) => q.eq("is_canonical", true))
      .collect();

    const pendingModes = allModes.filter((mode) => mode.status === "pending");

    return pendingRevisions.length + pendingModes.length;
  },
});

// Get revisions for a specific mode
export const getModeRevisions = query({
  args: { modeId: v.id("modes") },
  returns: v.array(SimpleModeRevisionSchema),
  handler: async (ctx, args) => {
    const mode = await ctx.db.get(args.modeId);
    if (!mode) {
      throw new Error("Mode not found");
    }

    // Find all revisions for modes with the same name and author
    const allModes = await ctx.db
      .query("modes")
      .withIndex("by_name_and_author", (q) =>
        q.eq("name", mode.name).eq("author", mode.author),
      )
      .collect();

    // Get all revision IDs
    const revisionIds = allModes
      .map((m) => m.revision_id)
      .filter(Boolean) as Array<Id<"mode_revisions">>;

    if (revisionIds.length === 0) return [];

    // Fetch all revisions
    const revisions = [];
    for (const revisionId of revisionIds) {
      const revision = await ctx.db.get(revisionId);
      if (revision) {
        const author = await ctx.db.get(revision.author_id);
        revisions.push({
          ...revision,
          author_name: author?.name || "Unknown",
        });
      }
    }

    return revisions.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Get original mode data for revision comparison
export const getOriginalModeForRevision = query({
  args: { revisionId: v.id("mode_revisions") },
  returns: v.union(v.null(), OriginalModeSchema),
  handler: async (ctx, args) => {
    const revision = await ctx.db.get(args.revisionId);
    if (!revision) {
      return null;
    }

    const originalMode = await ctx.db.get(revision.original_mode_id);
    if (!originalMode) {
      return null;
    }

    return {
      _id: originalMode._id,
      name: originalMode.name,
      description: originalMode.description,
      prompt: originalMode.prompt,
      instructions: originalMode.instructions,
      tools: originalMode.tools,
      version: originalMode.version,
    };
  },
});
