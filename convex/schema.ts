import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Customize the users table to add role field
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("user"), v.literal("moderator"), v.literal("admin")),
    ),
  })
    .index("email", ["email"])
    .index("name", ["name"]),

  modes: defineTable({
    name: v.string(),
    author: v.string(),
    description: v.string(),
    updated_at: v.string(),
    version: v.string(),
    tools: v.optional(v.any()),
    prompt: v.optional(v.string()),
    instructions: v.optional(
      v.array(
        v.object({
          title: v.string(),
          content: v.string(),
        }),
      ),
    ),
    resources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          content: v.string(),
          description: v.string(),
        }),
      ),
    ),
    temperature: v.optional(v.string()),
    model: v.optional(v.string()),
    votes: v.number(),
    downloads: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    is_canonical: v.boolean(), // True for the main version of each mode
    revision_id: v.optional(v.id("mode_revisions")), // Points to the revision that created this version
  })
    .index("by_votes", ["votes"])
    .index("by_downloads", ["downloads"])
    .index("by_name", ["name"])
    .index("by_status", ["status"])
    .index("by_canonical", ["is_canonical"])
    .index("by_revision", ["revision_id"])
    .index("by_name_version", ["name", "version"]),

  mode_revisions: defineTable({
    original_mode_id: v.id("modes"), // Points to the canonical mode being edited
    author_id: v.id("users"), // Who made this revision
    revision_type: v.union(v.literal("edit"), v.literal("new")), // Edit existing or new mode
    name: v.string(),
    description: v.string(),
    prompt: v.optional(v.string()),
    instructions: v.optional(
      v.array(
        v.object({
          title: v.string(),
          content: v.string(),
        }),
      ),
    ),
    resources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          content: v.string(),
          description: v.string(),
        }),
      ),
    ),
    temperature: v.optional(v.string()),
    model: v.optional(v.string()),
    tools: v.optional(v.any()),
    change_summary: v.string(), // What changed (PR message)
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    parent_version: v.string(), // Which version this is based on
    proposed_version: v.string(), // What version this would become
    created_at: v.string(),
  })
    .index("by_original_mode", ["original_mode_id"])
    .index("by_author", ["author_id"])
    .index("by_status", ["status"])
    .index("by_original_and_status", ["original_mode_id", "status"]),

  user_votes: defineTable({
    userId: v.id("users"),
    modeId: v.id("modes"),
    direction: v.union(v.literal("up"), v.literal("down")),
  })
    .index("by_user_and_mode", ["userId", "modeId"])
    .index("by_mode", ["modeId"]),

  models: defineTable({
    data: v.string(), // Raw JSON response from models.dev API
    lastUpdated: v.number(),
  }),
});
