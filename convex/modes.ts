import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import {
  BasicModeSchema,
  FullModeSchema,
  ModeSortSchema,
  SortOrderSchema,
  InstructionSchema,
  ResourceSchema,
  McpToolSchema,
} from "./types";
import { hasModeratorAccess } from "./users";

// Core mode management functions
export const listModes = query({
  args: {
    search: v.optional(v.string()),
    sortBy: v.optional(ModeSortSchema),
    sortOrder: v.optional(SortOrderSchema),
  },
  returns: v.array(BasicModeSchema),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    let user = null;
    if (userId) {
      user = await ctx.db.get(userId);
    }
    const hasModerator = hasModeratorAccess(user?.role);

    // Get only canonical modes (first version of each mode)
    const canonicalModes = await ctx.db
      .query("modes")
      .withIndex("by_canonical", (q) => q.eq("is_canonical", true))
      .collect();

    // Filter by status - non-moderators only see approved modes
    let statusFilteredModes = canonicalModes;
    if (!hasModerator) {
      statusFilteredModes = canonicalModes.filter(
        (mode) => mode.status === "approved",
      );
    }

    // Apply search filter
    let filteredModes = statusFilteredModes;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredModes = statusFilteredModes.filter(
        (mode) =>
          mode.name.toLowerCase().includes(searchLower) ||
          mode.author.toLowerCase().includes(searchLower) ||
          mode.description.toLowerCase().includes(searchLower) ||
          mode.status.toLowerCase().includes(searchLower),
      );
    }

    // Apply sorting
    if (args.sortBy) {
      filteredModes.sort((a, b) => {
        const aVal = a[args.sortBy!];
        const bVal = b[args.sortBy!];

        let comparison = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal;
        }

        return args.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return filteredModes.map((mode) => ({
      _id: mode._id,
      _creationTime: mode._creationTime,
      name: mode.name,
      author: mode.author,
      description: mode.description,
      votes: mode.votes,
      downloads: mode.downloads,
      updated_at: mode.updated_at,
      status: mode.status,
    }));
  },
});

// Paginated version for efficient loading with 25 modes per page
export const listModesPaginated = query({
  args: {
    search: v.optional(v.string()),
    sortBy: v.optional(ModeSortSchema),
    sortOrder: v.optional(SortOrderSchema),
    page: v.optional(v.number()), // 0-based
    pageSize: v.optional(v.number()), // default 25
  },
  returns: v.object({
    modes: v.array(BasicModeSchema),
    totalCount: v.number(),
    page: v.number(),
    pageSize: v.number(),
    totalPages: v.number(),
  }),
  handler: async (ctx, args) => {
    const page = args.page ?? 0;
    const pageSize = args.pageSize ?? 25;

    const userId = await getAuthUserId(ctx);
    let user = null;
    if (userId) {
      user = await ctx.db.get(userId);
    }
    const hasModerator = hasModeratorAccess(user?.role);

    // Get only canonical modes (first version of each mode)
    const canonicalModes = await ctx.db
      .query("modes")
      .withIndex("by_canonical", (q) => q.eq("is_canonical", true))
      .collect();

    // Filter by status - non-moderators only see approved modes
    let statusFilteredModes = canonicalModes;
    if (!hasModerator) {
      statusFilteredModes = canonicalModes.filter(
        (mode) => mode.status === "approved",
      );
    }

    // Apply search filter
    let filteredModes = statusFilteredModes;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredModes = statusFilteredModes.filter(
        (mode) =>
          mode.name.toLowerCase().includes(searchLower) ||
          mode.author.toLowerCase().includes(searchLower) ||
          mode.description.toLowerCase().includes(searchLower) ||
          mode.status.toLowerCase().includes(searchLower),
      );
    }

    // Apply sorting
    if (args.sortBy) {
      filteredModes.sort((a, b) => {
        const aVal = a[args.sortBy!];
        const bVal = b[args.sortBy!];

        let comparison = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal;
        }

        return args.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    // Calculate pagination
    const totalCount = filteredModes.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;

    // Get paginated slice
    const paginatedModes = filteredModes.slice(startIndex, endIndex);

    return {
      modes: paginatedModes.map((mode) => ({
        _id: mode._id,
        _creationTime: mode._creationTime,
        name: mode.name,
        author: mode.author,
        description: mode.description,
        votes: mode.votes,
        downloads: mode.downloads,
        updated_at: mode.updated_at,
        status: mode.status,
      })),
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  },
});

export const getMode = query({
  args: { modeId: v.id("modes") },
  returns: v.union(v.null(), FullModeSchema),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.modeId);
  },
});

export const getModeByName = query({
  args: { name: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("modes"),
      _creationTime: v.number(),
      name: v.string(),
      author: v.string(),
      description: v.string(),
      updated_at: v.string(),
      version: v.string(),
      tools: v.optional(v.any()),
      prompt: v.optional(v.string()),
      instructions: v.optional(v.array(InstructionSchema)),
      resources: v.optional(v.array(ResourceSchema)),
      temperature: v.optional(v.string()),
      model: v.optional(v.string()),
      votes: v.number(),
      downloads: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const mode = await ctx.db
      .query("modes")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .first();

    if (!mode) return null;

    return {
      _id: mode._id,
      _creationTime: mode._creationTime,
      name: mode.name,
      author: mode.author,
      description: mode.description,
      updated_at: mode.updated_at,
      version: mode.version,
      tools: mode.tools,
      prompt: mode.prompt,
      instructions: mode.instructions,
      resources: mode.resources,
      temperature: mode.temperature,
      model: mode.model,
      votes: mode.votes,
      downloads: mode.downloads,
      status: mode.status,
    };
  },
});

export const updateModeStatus = mutation({
  args: {
    modeId: v.id("modes"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    promotedVersionId: v.optional(v.id("modes")),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update mode status");
    }

    const user = await ctx.db.get(userId);
    if (!hasModeratorAccess(user?.role)) {
      throw new Error("Must be a moderator to update mode status");
    }

    const mode = await ctx.db.get(args.modeId);
    if (!mode) {
      throw new Error("Mode not found");
    }

    // Check if we're rejecting a canonical version
    const isRejectingCanonical =
      mode.is_canonical && args.status === "rejected";
    let promotedVersionId: Id<"modes"> | undefined;

    if (isRejectingCanonical) {
      // Find all versions of this mode
      const allVersions = await ctx.db
        .query("modes")
        .withIndex("by_name_and_author", (q) =>
          q.eq("name", mode.name).eq("author", mode.author),
        )
        .collect();

      // Find the latest approved non-canonical version
      const approvedVersions = allVersions.filter(
        (v) =>
          v.status === "approved" && !v.is_canonical && v._id !== args.modeId,
      );

      if (approvedVersions.length > 0) {
        // Helper function to parse version numbers
        const parseVersion = (version: string) => {
          const parts = version.replace(/^v/, "").split(".").map(Number);
          return parts.every((n) => !isNaN(n)) ? parts : [0];
        };

        // Sort by version number to find the latest
        approvedVersions.sort((a, b) => {
          const aVersion = parseVersion(a.version);
          const bVersion = parseVersion(b.version);

          // Compare version parts
          for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
            const aPart = aVersion[i] || 0;
            const bPart = bVersion[i] || 0;
            if (aPart !== bPart) {
              return bPart - aPart; // Descending order (latest first)
            }
          }

          // If versions are equal, sort by creation time (latest first)
          return b._creationTime - a._creationTime;
        });

        const latestApprovedVersion = approvedVersions[0];
        promotedVersionId = latestApprovedVersion._id;

        // Promote the latest approved version to canonical
        await ctx.db.patch(latestApprovedVersion._id, { is_canonical: true });
      }
    }

    // Update the status of the target mode
    await ctx.db.patch(args.modeId, {
      status: args.status,
      // If we're rejecting canonical and found a replacement, set to non-canonical
      ...(isRejectingCanonical && promotedVersionId
        ? { is_canonical: false }
        : {}),
    });

    // Prepare response message
    let message = `Mode status updated to ${args.status}`;
    if (isRejectingCanonical && promotedVersionId) {
      const promotedVersion = await ctx.db.get(promotedVersionId);
      message += `. Version ${promotedVersion?.version} has been promoted to current.`;
    } else if (isRejectingCanonical && !promotedVersionId) {
      message += `. No other approved versions found - mode family is now hidden.`;
    }

    return {
      success: true,
      message,
      promotedVersionId,
    };
  },
});

export const createMode = mutation({
  args: {
    name: v.string(),
    author: v.string(),
    description: v.string(),
    prompt: v.string(),
    version: v.string(),
    instructions: v.optional(v.array(InstructionSchema)),
    resources: v.optional(v.array(ResourceSchema)),
    temperature: v.optional(v.string()),
    model: v.optional(v.string()),
    mcp_tools: v.optional(v.array(McpToolSchema)),
    tools: v.optional(v.record(v.string(), v.boolean())),
  },
  returns: v.object({ modeId: v.id("modes") }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a mode");
    }

    const currentDate = new Date().toISOString();

    const modeId = await ctx.db.insert("modes", {
      name: args.name,
      author: args.author,
      description: args.description,
      updated_at: currentDate,
      version: args.version,
      tools: {
        mcp_tools: args.mcp_tools || [],
        tools: args.tools || {},
      },
      prompt: args.prompt,
      instructions: args.instructions || [],
      resources: args.resources || [],
      temperature: args.temperature,
      model: args.model,
      votes: 0,
      downloads: 0,
      status: "pending",
      is_canonical: true, // New modes are canonical by default
    });

    return { modeId };
  },
});

// Get mode with all its versions in a single query for better UX
export const getModeWithVersions = query({
  args: { modeId: v.id("modes") },
  returns: v.union(
    v.null(),
    v.object({
      mode: FullModeSchema,
      versions: v.array(FullModeSchema),
    }),
  ),
  handler: async (ctx, args) => {
    const mode = await ctx.db.get(args.modeId);
    if (!mode) {
      return null;
    }

    const userId = await getAuthUserId(ctx);
    let user = null;
    if (userId) {
      user = await ctx.db.get(userId);
    }
    const hasModerator = hasModeratorAccess(user?.role);

    // Find all versions of this mode by name and author
    const allVersions = await ctx.db
      .query("modes")
      .withIndex("by_name_and_author", (q) =>
        q.eq("name", mode.name).eq("author", mode.author),
      )
      .collect();

    // Filter by status - non-moderators only see approved modes
    const filteredVersions = hasModerator
      ? allVersions
      : allVersions.filter((version) => version.status === "approved");

    // Helper function to parse version numbers
    const parseVersion = (version: string) => {
      const parts = version.replace(/^v/, "").split(".").map(Number);
      return parts.every((n) => !isNaN(n)) ? parts : [0];
    };

    // Sort by version (oldest first, newest on right)
    filteredVersions.sort((a, b) => {
      const aVersion = parseVersion(a.version);
      const bVersion = parseVersion(b.version);

      // Compare version parts
      for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
        const aPart = aVersion[i] || 0;
        const bPart = bVersion[i] || 0;
        if (aPart !== bPart) {
          return aPart - bPart;
        }
      }

      // If versions are equal, sort by creation time (oldest first)
      return a._creationTime - b._creationTime;
    });

    return {
      mode,
      versions: filteredVersions,
    };
  },
});
