import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { VoteDirectionSchema } from "./types";

// Voting system functions
export const getUserVote = query({
  args: { modeId: v.id("modes") },
  returns: v.union(v.null(), VoteDirectionSchema),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const userVote = await ctx.db
      .query("user_votes")
      .withIndex("by_user_and_mode", (q) =>
        q.eq("userId", userId).eq("modeId", args.modeId),
      )
      .unique();

    return userVote?.direction || null;
  },
});

export const vote = mutation({
  args: {
    modeId: v.id("modes"),
    direction: VoteDirectionSchema,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to vote");
    }

    const mode = await ctx.db.get(args.modeId);
    if (!mode) {
      throw new Error("Mode not found");
    }

    // Check if user already has a vote for this mode
    const existingVote = await ctx.db
      .query("user_votes")
      .withIndex("by_user_and_mode", (q) =>
        q.eq("userId", userId).eq("modeId", args.modeId),
      )
      .unique();

    let voteChange = 0;

    if (existingVote) {
      // User is changing their vote
      if (existingVote.direction === args.direction) {
        // User is removing their vote (clicking same button)
        await ctx.db.delete(existingVote._id);
        voteChange = args.direction === "up" ? -1 : 1;
      } else {
        // User is changing from up to down or down to up
        await ctx.db.patch(existingVote._id, { direction: args.direction });
        voteChange = args.direction === "up" ? 2 : -2; // up to down = -2, down to up = +2
      }
    } else {
      // User is voting for the first time
      await ctx.db.insert("user_votes", {
        userId,
        modeId: args.modeId,
        direction: args.direction,
      });
      voteChange = args.direction === "up" ? 1 : -1;
    }

    // Update the aggregate vote count
    await ctx.db.patch(args.modeId, {
      votes: mode.votes + voteChange,
    });

    return null;
  },
});

// Download system functions
export const getUserDownloadStatus = query({
  args: { modeId: v.id("modes") },
  returns: v.boolean(),
  handler: async () => {
    // Since we don't track individual downloads, always return false
    // This means users can always download (button won't show as "already downloaded")
    return false;
  },
});

export const recordDownload = mutation({
  args: { modeId: v.id("modes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to download");
    }

    const mode = await ctx.db.get(args.modeId);
    if (!mode) {
      throw new Error("Mode not found");
    }

    // Simple download count increment without tracking individual downloads
    await ctx.db.patch(args.modeId, { downloads: mode.downloads + 1 });
    return null;
  },
});

export const incrementDownloadByModeId = mutation({
  args: {
    modeId: v.id("modes"),
  },
  returns: v.union(v.null(), v.id("modes")),
  handler: async (ctx, args) => {
    const mode = await ctx.db.get(args.modeId);

    if (!mode || mode.status !== "approved") {
      return null; // Mode not found or not approved
    }

    // Increment download count
    await ctx.db.patch(mode._id, { downloads: mode.downloads + 1 });
    return mode._id;
  },
});
