import { useState, useEffect } from "react";
import { GitBranchPlus } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MarkdownRenderer } from "../common/MarkdownRenderer";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { VoteDirection } from "../../lib/types";
import { useCopyToClipboard } from "../../hooks/ui/useCopyToClipboard";
import { useModalStore } from "../../lib/stores/modalStore";
import { useCurrentUser } from "../../lib/stores/userStore";
import { StatusBadge } from "../common/StatusBadge";

interface ModeModalProps {}

function titleCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ModeModal({}: ModeModalProps) {
  const [isVotingDisabled, setIsVotingDisabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    modeId?: Id<"modes">;
    newStatus?: "pending" | "approved" | "rejected";
    isCanonical?: boolean;
    modeName?: string;
    version?: string;
  }>({ open: false });

  // Get state from modal store
  const { selectedModeId, closeModeModal, openEditModeModal } = useModalStore();

  const [selectedVersionId, setSelectedVersionId] = useState(selectedModeId);

  // Initialize selectedVersionId when selectedModeId changes
  useEffect(() => {
    if (selectedModeId) {
      setSelectedVersionId(selectedModeId);
    }
  }, [selectedModeId]);

  const voteMutation = useMutation(api.mutation.vote);
  const recordDownloadMutation = useMutation(api.mutation.recordDownload);
  const updateModeStatus = useMutation(api.mutation.updateModeStatus);
  const userVote = useQuery(
    api.query.getUserVote,
    selectedVersionId ? { modeId: selectedVersionId } : "skip",
  );
  const { currentUser } = useCurrentUser();

  // Get mode data with all versions in a single query for better UX
  const modeWithVersions = useQuery(
    api.query.getModeWithVersions,
    selectedModeId ? { modeId: selectedModeId } : "skip",
  );

  const selectedModeData = useQuery(
    api.query.getMode,
    selectedVersionId ? { modeId: selectedVersionId } : "skip",
  );

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { copyToClipboard, copyStatus } = useCopyToClipboard();

  // Use selected mode data if available, fallback to base mode
  const displayMode = selectedModeData || modeWithVersions?.mode;

  // Pagination logic
  const VERSIONS_PER_PAGE = 5;
  const modeVersions = modeWithVersions?.versions || [];
  const totalPages = Math.ceil(modeVersions.length / VERSIONS_PER_PAGE);
  const startIndex = currentPage * VERSIONS_PER_PAGE;
  const endIndex = startIndex + VERSIONS_PER_PAGE;
  const visibleVersions = modeVersions.slice(startIndex, endIndex);

  useEffect(() => {
    if (selectedModeId) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [selectedModeId]);

  // Early return if modal is not open or no mode selected - AFTER ALL HOOKS
  if (!selectedModeId || !displayMode) return null;

  const handleVote = async (direction: VoteDirection) => {
    if (!selectedVersionId) return;
    try {
      setIsVotingDisabled(true);
      await voteMutation({
        modeId: selectedVersionId,
        direction,
      });
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setIsVotingDisabled(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedVersionId || !displayMode) return;
    try {
      // Record download
      await recordDownloadMutation({ modeId: selectedVersionId });

      const promptText = displayMode.prompt || "";
      const blob = new Blob([promptText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${displayMode.name.replace(/\s+/g, "-").toLowerCase()}.mode.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  const handleScrollToInstruction = (index: number) => {
    if (index === -1) {
      // Scroll to mode prompt
      const element = document.getElementById("mode-prompt");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Scroll to instruction
      const element = document.getElementById(`instruction-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleStatusUpdate = async (
    modeId: Id<"modes">,
    newStatus: "pending" | "approved" | "rejected",
  ) => {
    // Find the mode info for confirmation dialog
    const modeToUpdate = modeVersions.find((m) => m._id === modeId);
    const isCanonical = modeToUpdate?.is_canonical;

    // Show confirmation dialog for status changes
    setConfirmDialog({
      open: true,
      modeId,
      newStatus,
      isCanonical,
      modeName: modeToUpdate?.name,
      version: modeToUpdate?.version,
    });
  };

  const confirmStatusUpdate = async () => {
    const { modeId, newStatus } = confirmDialog;
    if (!modeId || !newStatus) return;

    try {
      const result = await updateModeStatus({ modeId, status: newStatus });

      // Show result message based on response
      if (result.message) {
        // You could add a toast notification here
        console.log(result.message);
      }

      // Close the confirmation dialog
      setConfirmDialog({ open: false });

      // If a version was promoted, update the selected version
      if (result.promotedVersionId) {
        setSelectedVersionId(result.promotedVersionId);
      }
    } catch (error) {
      console.error("Failed to update mode status:", error);
      setConfirmDialog({ open: false });
    }
  };

  const parseTools = (toolsConfig: any) => {
    const mcpTools: Array<{ name: string; url?: string }> = [];
    const disabledTools: string[] = [];

    if (!toolsConfig) return { mcpTools, disabledTools };

    // Parse MCP tools
    if (toolsConfig.mcp_tools && Array.isArray(toolsConfig.mcp_tools)) {
      toolsConfig.mcp_tools.forEach((tool: any) => {
        mcpTools.push({
          name: tool.name,
          url: tool.url ? tool.url.replace(/^"|"$/g, "") : undefined, // Remove quotes from URL
        });
      });
    }

    // Parse disabled tools
    if (toolsConfig.tools) {
      Object.entries(toolsConfig.tools).forEach(([tool, enabled]) => {
        if (enabled === false) {
          disabledTools.push(tool);
        }
      });
    }

    return { mcpTools, disabledTools };
  };

  const { mcpTools, disabledTools } = parseTools(displayMode.tools);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModeModal}
      />

      {/* Modal */}
      <div className="relative bg-background border border-muted rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-muted">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-tight">
                {titleCase(displayMode.name)}
              </h2>

              <div className="flex flex-1 items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    className={`flex items-center justify-center p-1.5 border rounded bg-transparent cursor-pointer transition-all duration-200 text-text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:border-muted disabled:bg-transparent disabled:text-text-primary disabled:hover:border-muted disabled:hover:text-text-primary disabled:hover:bg-transparent ${
                      userVote === "up"
                        ? "border-accent text-accent bg-accent/10"
                        : "border-muted hover:border-accent hover:text-accent hover:bg-accent/5"
                    }`}
                    disabled={isVotingDisabled}
                    onClick={() => handleVote("up")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                  </button>
                  <span className="min-w-[2ch] font-mono text-sm font-semibold text-white text-center">
                    {displayMode.votes}
                  </span>
                  <button
                    className={`flex items-center justify-center p-1.5 border rounded bg-transparent cursor-pointer transition-all duration-200 text-text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:border-muted disabled:bg-transparent disabled:text-text-primary disabled:hover:border-muted disabled:hover:text-text-primary disabled:hover:bg-transparent ${
                      userVote === "down"
                        ? "border-accent text-accent bg-accent/10"
                        : "border-muted hover:border-accent hover:text-accent hover:bg-accent/5"
                    }`}
                    disabled={isVotingDisabled}
                    onClick={() => handleVote("down")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                    </svg>
                  </button>
                </div>

                {/* Version Tabs - moved here to the middle */}
                {modeVersions && modeVersions.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Tabs
                      value={selectedVersionId || ""}
                      onValueChange={(value) =>
                        setSelectedVersionId(value as Id<"modes">)
                      }
                      className="w-fit"
                    >
                      <div className="flex items-center gap-2">
                        <TabsList className="bg-background-light border border-muted">
                          {visibleVersions.map((version) => (
                            <TabsTrigger
                              key={version._id}
                              value={version._id}
                              className="data-[state=active]:bg-accent data-[state=active]:text-background text-text-primary text-xs px-2 py-1"
                            >
                              {version.version}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage(Math.max(0, currentPage - 1))
                              }
                              disabled={currentPage === 0}
                              className="h-7 w-7 p-0 border-muted bg-background-light text-text-primary hover:bg-accent/20 hover:border-accent disabled:opacity-50"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="15,18 9,12 15,6"></polyline>
                              </svg>
                            </Button>
                            <span className="text-xs text-text-primary px-2">
                              {currentPage + 1}/{totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage(
                                  Math.min(totalPages - 1, currentPage + 1),
                                )
                              }
                              disabled={currentPage === totalPages - 1}
                              className="h-7 w-7 p-0 border-muted bg-background-light text-text-primary hover:bg-accent/20 hover:border-accent disabled:opacity-50"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="9,18 15,12 9,6"></polyline>
                              </svg>
                            </Button>
                          </div>
                        )}
                      </div>
                    </Tabs>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <span className="min-w-[2ch] font-mono text-sm font-semibold text-white text-center">
                    {displayMode.downloads}
                  </span>
                  <button
                    className="flex items-center justify-center p-1.5 border border-muted rounded bg-transparent cursor-pointer transition-all duration-200 hover:border-accent hover:text-accent hover:bg-accent/5 text-text-primary"
                    onClick={handleDownload}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  {currentUser && (
                    <button
                      onClick={() => openEditModeModal()}
                      className="px-2 py-1 text-xs rounded ml-2 bg-brand text-background hover:bg-brand-hover cursor-pointer transition-colors"
                      title="Propose Edit"
                    >
                      <GitBranchPlus className="w-4 h-4 inline-block mr-1" />
                      Edit{" "}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs italic text-text-primary">
                by {displayMode.author}
              </p>
              {currentUser?.role === "moderator" ||
              currentUser?.role === "admin" ? (
                <Tabs
                  value={displayMode.status}
                  onValueChange={(newStatus) =>
                    handleStatusUpdate(
                      displayMode._id,
                      newStatus as "pending" | "approved" | "rejected",
                    )
                  }
                >
                  <TabsList className="bg-background-light border border-muted h-7">
                    <TabsTrigger
                      value="pending"
                      className="data-[state=active]:bg-accent data-[state=active]:text-background text-text-primary text-xs px-2 py-1 cursor-pointer"
                    >
                      Pending
                    </TabsTrigger>
                    <TabsTrigger
                      value="approved"
                      className="data-[state=active]:bg-accent data-[state=active]:text-background text-text-primary text-xs px-2 py-1 cursor-pointer"
                    >
                      Approved
                    </TabsTrigger>
                    <TabsTrigger
                      value="rejected"
                      className="data-[state=active]:bg-accent data-[state=active]:text-background text-text-primary text-xs px-2 py-1 cursor-pointer"
                    >
                      Rejected
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              ) : (
                <StatusBadge status={displayMode.status} />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 text-sm overflow-y-auto modal-scrollbar">
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="m-0 mb-3 text-sm font-semibold text-text-primary">
                DESCRIPTION
              </h4>
              <MarkdownRenderer content={displayMode.description} />
            </div>

            {mcpTools.length > 0 && (
              <div>
                <h4 className="m-0 mb-3 text-sm font-semibold text-text-primary">
                  MCP
                </h4>
                <div className="flex flex-wrap gap-2">
                  {mcpTools.map((tool) => {
                    const toolName =
                      typeof tool === "string" ? tool : tool.name;
                    const toolUrl =
                      typeof tool === "object" && tool.url ? tool.url : null;
                    return toolUrl ? (
                      <a
                        key={toolName}
                        href={toolUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative inline-block py-2 px-3 font-mono text-[13px] no-underline rounded bg-[#111] text-text-primary transition-all duration-200 cursor-pointer hover:bg-accent hover:text-muted hover:-translate-y-px after:content-[''] after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:rounded-full after:border after:border-background after:bg-accent"
                      >
                        {toolName}
                      </a>
                    ) : (
                      <span
                        key={toolName}
                        className="relative inline-block py-2 px-3 font-mono text-[13px] no-underline rounded bg-[#111] text-text-primary transition-all duration-200 after:content-[''] after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:rounded-full after:border after:border-background after:bg-accent"
                      >
                        {toolName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {disabledTools.length > 0 && (
              <div>
                <h4 className="m-0 mb-3 text-sm font-semibold text-text-primary">
                  DISABLED TOOLS
                </h4>{" "}
                <div className="flex flex-wrap gap-2">
                  {disabledTools.map((tool) => (
                    <span
                      key={tool}
                      className="relative inline-block py-2 px-3 font-mono text-[13px] no-underline rounded bg-[#111] text-text-primary transition-all duration-200 hover:bg-accent/30 hover:text-text-primary after:content-[''] after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:rounded-full after:border after:border-background after:bg-red-400/30"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {((displayMode.instructions &&
              displayMode.instructions.length > 0) ||
              displayMode.prompt) && (
              <div>
                <h4 className="m-0 mb-3 text-sm font-semibold text-text-primary">
                  PROMPTS
                </h4>
                <div className="flex flex-wrap gap-2">
                  {displayMode.prompt && (
                    <button
                      onClick={() => handleScrollToInstruction(-1)}
                      className="inline-block py-2 px-3 font-mono text-[13px] no-underline rounded-r bg-[#111] text-text-primary transition-all duration-200 cursor-pointer hover:bg-brand/20 hover:text-text-primary hover:-translate-y-px border-l-3 border-brand"
                    >
                      Mode Prompt
                    </button>
                  )}
                  {displayMode.instructions &&
                    displayMode.instructions.map(
                      (instruction: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleScrollToInstruction(index)}
                          className="inline-block py-2 px-3 font-mono text-[13px] no-underline rounded-r bg-[#111] text-text-primary transition-all duration-200 cursor-pointer hover:bg-brand-complementary/20 hover:text-text-primary hover:-translate-y-px border-l-3 border-brand-complementary"
                        >
                          {instruction.title}
                        </button>
                      ),
                    )}
                </div>
              </div>
            )}

            <div>
              <h4 className="m-0 mb-3 text-sm font-semibold text-text-primary">
                MODE PROMPT
              </h4>
              <div
                id="mode-prompt"
                className="relative p-2 rounded-r-md border-l-3 border-brand bg-background-light overflow-hidden"
              >
                <button
                  className={`absolute top-0 right-0 m-0 py-1 px-2 text-[10px] font-semibold leading-none uppercase tracking-wide border border-muted rounded-r-md bg-background text-text-primary cursor-pointer transition-all duration-200 z-[2] hover:bg-brand hover:text-muted focus:bg-brand focus:text-muted focus:outline-none ${copyStatus["prompt"] ? "bg-brand text-muted" : ""}`}
                  onClick={() =>
                    copyToClipboard(displayMode.prompt || "", "prompt")
                  }
                >
                  {copyStatus["prompt"] ? "Copied!" : "PROMPT"}
                </button>
                <div className="m-0 py-1.5 pr-8 pl-2.5 overflow-x-auto">
                  <MarkdownRenderer content={displayMode.prompt || ""} />
                </div>
              </div>
            </div>

            {displayMode.instructions &&
              displayMode.instructions.length > 0 && (
                <div>
                  <h4 className="m-0 mb-3 text-sm font-semibold text-text-primary">
                    INSTRUCTIONS
                  </h4>
                  <div className="flex flex-col gap-4">
                    {displayMode.instructions.map(
                      (instruction: any, index: number) => (
                        <div
                          key={index}
                          id={`instruction-${index}`}
                          className="relative p-2 rounded-r-md border-l-3 border-brand-complementary bg-background-light overflow-hidden"
                        >
                          {" "}
                          <button
                            className={`absolute top-0 right-0 m-0 py-1 px-2 text-[10px] font-semibold leading-none uppercase tracking-wide border border-muted rounded-r-md bg-background text-text-primary cursor-pointer transition-all duration-200 z-[2] hover:bg-brand-complementary hover:text-muted focus:bg-brand-complementary focus:text-muted focus:outline-none ${copyStatus[`instruction-${index}`] ? "bg-brand-complementary text-muted" : ""}`}
                            onClick={() =>
                              copyToClipboard(
                                instruction.content,
                                `instruction-${index}`,
                              )
                            }
                          >
                            {copyStatus[`instruction-${index}`]
                              ? "Copied!"
                              : instruction.title}
                          </button>
                          <div className="m-0 py-1.5 pr-8 pl-2.5 overflow-x-auto">
                            <MarkdownRenderer content={instruction.content} />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Status Update Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open })}
      >
        <DialogContent className="!bg-background border !border-muted text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              Confirm Status Change
            </DialogTitle>
            <DialogDescription className="!text-text-primary">
              {confirmDialog.isCanonical &&
              confirmDialog.newStatus === "rejected" ? (
                <>
                  You are about to reject the current version (
                  {confirmDialog.version}) of "{confirmDialog.modeName}".
                  {modeVersions.filter(
                    (v) => v.status === "approved" && !v.is_canonical,
                  ).length > 0
                    ? " The latest approved version will automatically become the new current version."
                    : " This will hide the entire mode family as no other approved versions exist."}
                </>
              ) : (
                <>
                  You are about to change the status of version{" "}
                  {confirmDialog.version} of "{confirmDialog.modeName}" to{" "}
                  {confirmDialog.newStatus}.
                  {!confirmDialog.isCanonical &&
                    " This will not affect the other versions visible to users."}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false })}
              className="border-muted bg-muted text-text-primary hover:bg-muted-hover hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusUpdate}
              className="bg-accent text-muted hover:bg-accent/90"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
