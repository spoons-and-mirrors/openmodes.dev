import { MarkdownRenderer } from "../common/MarkdownRenderer";
import { ToolsList } from "../common/ToolsList";
import { VoteButtons } from "../common/VoteButtons";
import { DownloadButton } from "../common/DownloadButton";
import { StatusBadge } from "../common/StatusBadge";
import { Id } from "../../../convex/_generated/dataModel";
import { VoteDirection, UserRole } from "../../lib/types";

interface Mode {
  _id: Id<"modes">;
  _creationTime: number;
  name: string;
  author: string;
  description: string;
  updated_at: string;
  version: string;
  tools?: any;
  prompt?: string;
  instructions?: Array<{ title: string; content: string }>;
  votes: number;
  downloads: number;
  status: "pending" | "approved" | "rejected";
}

interface ModeContentProps {
  mode: Mode;
  userVote: VoteDirection | null;
  isVotingDisabled: boolean;
  onVote: (direction: VoteDirection) => void;
  onDownload: () => void;
  onCopy: (content: string, key: string) => void;
  copyStatus: Record<string, boolean>;
  currentUser?: { role?: UserRole } | null;
  onStatusUpdate?: (
    modeId: Id<"modes">,
    currentStatus: "pending" | "approved" | "rejected",
  ) => void;
}

function parseTools(toolsConfig: any) {
  const mcpTools: Array<{ name: string; url?: string }> = [];
  const disabledTools: Array<{ name: string }> = [];

  if (!toolsConfig) return { mcpTools, disabledTools };

  // Parse MCP tools
  if (toolsConfig.mcp_tools && Array.isArray(toolsConfig.mcp_tools)) {
    toolsConfig.mcp_tools.forEach((tool: any) => {
      mcpTools.push({
        name: tool.name,
        url: tool.url ? tool.url.replace(/^"|"$/g, "") : undefined,
      });
    });
  }

  // Parse disabled tools
  if (toolsConfig.tools) {
    Object.entries(toolsConfig.tools).forEach(([tool, enabled]) => {
      if (enabled === false) {
        disabledTools.push({ name: tool });
      }
    });
  }

  return { mcpTools, disabledTools };
}

export function ModeContent({
  mode,
  userVote,
  isVotingDisabled,
  onVote,
  onDownload,
  onCopy,
  copyStatus,
  currentUser,
  onStatusUpdate,
}: ModeContentProps) {
  const { mcpTools, disabledTools } = parseTools(mode.tools);

  const handleStatusClick = () => {
    if (onStatusUpdate) {
      onStatusUpdate(mode._id, mode.status);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold text-white">{mode.name}</h1>
            <span className="text-sm text-text-secondary">
              by {mode.author}
            </span>
            <span className="text-sm text-text-secondary">v{mode.version}</span>
            {(currentUser?.role === "moderator" ||
              currentUser?.role === "admin") && (
              <StatusBadge
                status={mode.status}
                onClick={handleStatusClick}
                className="cursor-pointer"
              />
            )}
          </div>
          <p className="text-sm text-text-primary mb-4">{mode.description}</p>
        </div>

        <div className="flex items-center gap-4">
          <VoteButtons
            votes={mode.votes}
            userVote={userVote}
            isDisabled={isVotingDisabled}
            onVote={onVote}
          />
          <DownloadButton downloads={mode.downloads} onDownload={onDownload} />
        </div>
      </div>

      {/* Tools Section */}
      <div className="space-y-4">
        <ToolsList tools={mcpTools} title="MCP Tools" variant="mcp" />

        <ToolsList
          tools={disabledTools}
          title="Disabled Tools"
          variant="disabled"
        />
      </div>

      {/* Mode Prompt Section */}
      {mode.prompt && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-text-primary">
              Mode Prompt
            </h4>
            <button
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => onCopy(mode.prompt!, "prompt")}
            >
              {copyStatus.prompt ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="bg-background-light border border-muted rounded p-4">
            <MarkdownRenderer content={mode.prompt} />
          </div>
        </div>
      )}

      {/* Instructions Section */}
      {mode.instructions && mode.instructions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">
            Context Instructions
          </h4>
          <div className="space-y-3">
            {mode.instructions.map((instruction, index) => (
              <div
                key={index}
                className="bg-background-light border border-muted rounded p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">
                    {instruction.title}
                  </h5>
                  <button
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                    onClick={() =>
                      onCopy(instruction.content, `instruction-${index}`)
                    }
                  >
                    {copyStatus[`instruction-${index}`] ? "Copied!" : "Copy"}
                  </button>
                </div>
                <MarkdownRenderer content={instruction.content} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
