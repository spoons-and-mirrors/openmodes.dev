import { Id } from "../../../convex/_generated/dataModel";

// Common status types
export type Status = "pending" | "approved" | "rejected";
export type VoteDirection = "up" | "down";
export type ModeStatus = "pending" | "approved";

// Mode-related types
export interface ContextInstruction {
  title: string;
  content: string;
}

export interface Resource {
  title: string;
  content: string;
}

export interface McpTool {
  type: "local" | "remote";
  name: string;
  command?: string;
  url?: string;
}

export interface ModeFormData {
  name: string;
  description: string;
  mode_prompt: string;
  author: string;
  temperature?: string;
  model?: string;
}

export interface ModeBase {
  _id: Id<"modes">;
  _creationTime: number;
  name: string;
  author: string;
  description: string;
  updated_at: string;
  version: string;
  votes: number;
  downloads: number;
  status: ModeStatus;
}

export interface Mode extends ModeBase {
  tools?: {
    mcp_tools?: McpTool[];
    tools?: Record<string, boolean>;
  };
  prompt?: string;
  instructions?: ContextInstruction[];
  is_canonical: boolean;
  revision_id?: Id<"mode_revisions">;
}

export type UserRole = "user" | "moderator" | "admin";

export interface User {
  _id: Id<"users">;
  name?: string;
  email?: string;
  role?: UserRole;
}

// Form-related types
export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  description?: string;
  error?: string;
  className?: string;
}

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl";
  showCloseButton?: boolean;
}

// Table sorting types
export type SortField =
  | "name"
  | "author"
  | "votes"
  | "downloads"
  | "updated_at"
  | "status";
export type SortOrder = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}
