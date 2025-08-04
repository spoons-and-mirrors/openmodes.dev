import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { UserRoleSchema, UserSchema } from "./types";

// Helper functions for role checking
export const hasModeratorAccess = (role?: string) =>
  role === "moderator" || role === "admin";

export const hasAdminAccess = (role?: string) => role === "admin";

// Get current authenticated user
export const getCurrentUser = query({
  args: {},
  returns: v.union(v.null(), UserSchema),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
    };
  },
});

// Get all users for admin panel
export const getAllUsers = query({
  args: {
    search: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      role: v.optional(UserRoleSchema),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to view users");
    }

    const currentUser = await ctx.db.get(userId);
    if (!hasAdminAccess(currentUser?.role)) {
      throw new Error("Must be an admin to view users");
    }

    let users = await ctx.db.query("users").collect();

    // Apply search filter if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      users = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          (user.role || "user").toLowerCase().includes(searchLower),
      );
    }

    return users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      _creationTime: user._creationTime,
    }));
  },
});

// Update user role
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: UserRoleSchema,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Must be logged in to update user roles");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!hasAdminAccess(currentUser?.role)) {
      throw new Error("Must be an admin to update user roles");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return null;
  },
});
