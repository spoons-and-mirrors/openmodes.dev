import { v } from "convex/values";

// User role types
export const UserRoleSchema = v.union(
  v.literal("user"),
  v.literal("moderator"),
  v.literal("admin"),
);

// Mode status types
export const ModeStatusSchema = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

// Mode sort options
export const ModeSortSchema = v.union(
  v.literal("name"),
  v.literal("author"),
  v.literal("votes"),
  v.literal("downloads"),
  v.literal("updated_at"),
  v.literal("status"),
);

// Sort order options
export const SortOrderSchema = v.union(v.literal("asc"), v.literal("desc"));

// Vote direction types
export const VoteDirectionSchema = v.union(v.literal("up"), v.literal("down"));

// Instruction schema
export const InstructionSchema = v.object({
  title: v.string(),
  content: v.string(),
});

// MCP tool schema
export const McpToolSchema = v.object({
  type: v.union(v.literal("local"), v.literal("remote")),
  name: v.string(),
  command: v.optional(v.string()),
  url: v.optional(v.string()),
});

// Tools schema (combined MCP tools and regular tools)
export const ToolsSchema = v.object({
  mcp_tools: v.array(McpToolSchema),
  tools: v.record(v.string(), v.boolean()),
});

// Revision type schema
export const RevisionTypeSchema = v.union(v.literal("edit"), v.literal("new"));

// Revision status schema
export const RevisionStatusSchema = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

// Basic mode schema (for listing)
export const BasicModeSchema = v.object({
  _id: v.id("modes"),
  _creationTime: v.number(),
  name: v.string(),
  author: v.string(),
  description: v.string(),
  votes: v.number(),
  downloads: v.number(),
  updated_at: v.string(),
  status: ModeStatusSchema,
});

// Full mode schema (for detailed view)
export const FullModeSchema = v.object({
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
  votes: v.number(),
  downloads: v.number(),
  status: ModeStatusSchema,
  is_canonical: v.boolean(),
  revision_id: v.optional(v.id("mode_revisions")),
});

// User schema
export const UserSchema = v.object({
  _id: v.id("users"),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  role: v.optional(UserRoleSchema),
});

// Mode revision schema (for display)
export const ModeRevisionSchema = v.object({
  _id: v.id("mode_revisions"),
  _creationTime: v.number(),
  original_mode_id: v.id("modes"),
  author_id: v.id("users"),
  revision_type: RevisionTypeSchema,
  name: v.string(),
  description: v.string(),
  prompt: v.optional(v.string()),
  instructions: v.optional(v.array(InstructionSchema)),
  tools: v.optional(v.any()),
  change_summary: v.string(),
  status: RevisionStatusSchema,
  parent_version: v.string(),
  proposed_version: v.string(),
  created_at: v.string(),
  author_name: v.optional(v.string()),
  original_mode_name: v.string(),
});

// Simplified revision schema (for mode revisions listing)
export const SimpleModeRevisionSchema = v.object({
  _id: v.id("mode_revisions"),
  _creationTime: v.number(),
  author_id: v.id("users"),
  revision_type: RevisionTypeSchema,
  change_summary: v.string(),
  status: RevisionStatusSchema,
  parent_version: v.string(),
  proposed_version: v.string(),
  created_at: v.string(),
  author_name: v.optional(v.string()),
});

// Original mode for revision comparison
export const OriginalModeSchema = v.object({
  _id: v.id("modes"),
  name: v.string(),
  description: v.string(),
  prompt: v.optional(v.string()),
  instructions: v.optional(v.array(InstructionSchema)),
  tools: v.optional(v.any()),
  version: v.string(),
});
