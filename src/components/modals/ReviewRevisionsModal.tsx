import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { BaseModal } from "../common/BaseModal";
import { useModalStore } from "../../lib/stores/modalStore";
import { useCurrentUser } from "../../lib/stores/userStore";

interface ReviewPendingModalProps {}

interface Revision {
  _id: Id<"mode_revisions">;
  _creationTime: number;
  author_id: Id<"users">;
  revision_type: "edit" | "new";
  change_summary: string;
  status: "pending" | "approved" | "rejected";
  parent_version: string;
  proposed_version: string;
  created_at: string;
  author_name?: string;
  original_mode_id: Id<"modes">;
  name: string;
  description: string;
  prompt?: string;
  instructions?: { title: string; content: string }[];
  tools?: any;
}

// Simple diff component for showing changes
function DiffView({
  original,
  revised,
  label,
}: {
  original: string;
  revised: string;
  label: string;
}) {
  const originalLines = original.split("\n");
  const revisedLines = revised.split("\n");

  // Simple line-by-line comparison
  const maxLines = Math.max(originalLines.length, revisedLines.length);

  const changes = [];
  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i] || "";
    const revLine = revisedLines[i] || "";

    if (origLine !== revLine) {
      if (origLine && !revLine) {
        changes.push({ type: "removed", line: origLine, lineNum: i + 1 });
      } else if (!origLine && revLine) {
        changes.push({ type: "added", line: revLine, lineNum: i + 1 });
      } else {
        changes.push({ type: "removed", line: origLine, lineNum: i + 1 });
        changes.push({ type: "added", line: revLine, lineNum: i + 1 });
      }
    }
  }

  if (changes.length === 0) {
    return (
      <div className="bg-background-light border border-muted p-3 rounded">
        <div className="text-sm text-text-secondary italic">
          No changes in {label}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light border border-muted p-3 rounded">
      <div className="font-medium text-sm text-text-primary mb-2">
        {label} Changes
      </div>
      <div className="space-y-1">
        {changes.map((change, idx) => (
          <div
            key={idx}
            className={`text-sm font-mono p-1 rounded ${
              change.type === "removed"
                ? "bg-red-900/20 text-red-300 border-l-2 border-red-500"
                : "bg-green-900/20 text-green-300 border-l-2 border-green-500"
            }`}
          >
            <span className="text-text-secondary text-xs mr-2">
              {change.type === "removed" ? "-" : "+"}
            </span>
            {change.line}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewPendingModal({}: ReviewPendingModalProps) {
  const { showReviewModal, closeReviewModal, openModeModal } = useModalStore();
  const { currentUser } = useCurrentUser();
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"changes" | "proposed">("changes");
  const [activeTab, setActiveTab] = useState<"revisions" | "modes">("modes");

  // Only query if user is authenticated and has moderator access
  const shouldQuery =
    currentUser &&
    (currentUser.role === "moderator" || currentUser.role === "admin");

  const pendingRevisions = useQuery(
    api.query.getPendingRevisions,
    shouldQuery ? {} : "skip",
  );

  // Get pending modes (status: "pending")
  const pendingModes = useQuery(
    api.query.listModes,
    shouldQuery ? { sortBy: "updated_at", sortOrder: "desc" } : "skip",
  );

  const reviewRevision = useMutation(api.mutation.reviewRevision);
  const originalMode = useQuery(
    api.query.getOriginalModeForRevision,
    selectedRevision && shouldQuery
      ? { revisionId: selectedRevision._id }
      : "skip",
  );

  // Filter pending modes from the list
  const filteredPendingModes =
    pendingModes?.filter((mode) => mode.status === "pending") || [];

  // Reset selections when switching tabs
  const handleTabChange = (tab: "revisions" | "modes") => {
    setActiveTab(tab);
    setSelectedRevision(null);
  };

  const handleReview = async (
    revisionId: Id<"mode_revisions">,
    action: "approve" | "reject",
  ) => {
    try {
      await reviewRevision({ revisionId, action });
      setSelectedRevision(null);
    } catch (error) {
      console.error("Error reviewing revision:", error);
    }
  };

  if (!showReviewModal) return null;

  // If user is not authenticated or doesn't have moderator access, show error
  if (!shouldQuery) {
    return (
      <BaseModal
        isOpen={showReviewModal}
        onClose={closeReviewModal}
        title="Review Pending Items"
        maxWidth="md"
        showCloseButton={true}
      >
        <div className="p-6 text-center">
          <div className="text-4xl mb-4">🚫</div>
          <p className="text-text-secondary">
            You need moderator privileges to access this feature.
          </p>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={showReviewModal}
      onClose={closeReviewModal}
      title="Review Pending Items"
      maxWidth="6xl"
      showCloseButton={true}
    >
      {/* Content */}
      <div className="flex flex-1 overflow-hidden h-[calc(90vh-8rem)]">
        {/* Left Panel - Tabs and Lists */}
        <div className="w-1/3 border-r border-muted overflow-hidden flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-muted p-4">
            <button
              onClick={() => handleTabChange("modes")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "modes"
                  ? "text-accent border-b-2 border-accent"
                  : "text-text-primary hover:text-white"
              }`}
            >
              Modes ({filteredPendingModes.length})
            </button>
            <button
              onClick={() => handleTabChange("revisions")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "revisions"
                  ? "text-accent border-b-2 border-accent"
                  : "text-text-primary hover:text-white"
              }`}
            >
              Revisions ({pendingRevisions?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto modal-scrollbar">
            {activeTab === "modes" ? (
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-3">
                  Pending Modes
                </h3>
                {filteredPendingModes.length === 0 && (
                  <p className="text-text-secondary text-sm">
                    No pending modes
                  </p>
                )}
                {filteredPendingModes.map((mode) => (
                  <div
                    key={mode._id}
                    onClick={() => {
                      closeReviewModal();
                      openModeModal(mode._id);
                    }}
                    className="p-3 border rounded-lg mb-2 cursor-pointer transition-colors border-muted hover:border-[#444] bg-background-light hover:bg-accent/10"
                  >
                    <div className="font-medium text-sm text-white">
                      {mode.name}
                    </div>
                    <div className="text-xs text-text-primary mt-1">
                      by {mode.author}
                    </div>
                    <div className="text-xs text-[#999] mt-1 line-clamp-2">
                      {mode.description}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {new Date(mode.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-3">
                  Pending Revisions
                </h3>
                {pendingRevisions?.length === 0 && (
                  <p className="text-text-secondary text-sm">
                    No pending revisions
                  </p>
                )}
                {pendingRevisions?.map((revision) => (
                  <div
                    key={revision._id}
                    onClick={() => {
                      setSelectedRevision(revision);
                    }}
                    className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                      selectedRevision?._id === revision._id
                        ? "border-accent bg-accent/10"
                        : "border-muted hover:border-[#444] bg-background-light"
                    }`}
                  >
                    <div className="font-medium text-sm text-white">
                      {revision.name}
                    </div>
                    <div className="text-xs text-text-primary mt-1">
                      by {revision.author_name || "Unknown"}
                    </div>
                    <div className="text-xs text-[#999] mt-1 line-clamp-2">
                      {revision.change_summary}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {new Date(revision.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="flex-1 overflow-y-auto modal-scrollbar">
          {selectedRevision ? (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {selectedRevision.name}
                </h3>
                <div className="text-sm text-text-primary mb-2">
                  Version: {selectedRevision.parent_version} →{" "}
                  {selectedRevision.proposed_version}
                </div>
                <div className="text-sm text-text-primary mb-4">
                  Proposed by: {selectedRevision.author_name || "Unknown"}
                </div>

                <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-accent mb-2">
                    Change Summary
                  </h4>
                  <p className="text-white">
                    {selectedRevision.change_summary}
                  </p>
                </div>
              </div>

              {/* View Mode Tabs */}
              <div className="flex border-b border-muted mb-6">
                <button
                  onClick={() => setViewMode("changes")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === "changes"
                      ? "text-accent border-b-2 border-accent"
                      : "text-text-primary hover:text-white"
                  }`}
                >
                  Changes
                </button>
                <button
                  onClick={() => setViewMode("proposed")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === "proposed"
                      ? "text-accent border-b-2 border-accent"
                      : "text-text-primary hover:text-white"
                  }`}
                >
                  Proposed
                </button>
              </div>

              <div className="space-y-6">
                {viewMode === "changes" && originalMode ? (
                  // Diff View
                  <>
                    <DiffView
                      original={originalMode.name}
                      revised={selectedRevision.name}
                      label="Name"
                    />

                    <DiffView
                      original={originalMode.description}
                      revised={selectedRevision.description}
                      label="Description"
                    />

                    {selectedRevision.prompt && (
                      <DiffView
                        original={originalMode.prompt || ""}
                        revised={selectedRevision.prompt}
                        label="Prompt"
                      />
                    )}

                    {selectedRevision.instructions &&
                      selectedRevision.instructions.length > 0 && (
                        <DiffView
                          original={
                            originalMode.instructions
                              ?.map((i) => `${i.title}: ${i.content}`)
                              .join("\n") || ""
                          }
                          revised={selectedRevision.instructions
                            .map((i) => `${i.title}: ${i.content}`)
                            .join("\n")}
                          label="Context Instructions"
                        />
                      )}

                    {selectedRevision.tools && (
                      <DiffView
                        original={JSON.stringify(
                          originalMode.tools || {},
                          null,
                          2,
                        )}
                        revised={JSON.stringify(
                          selectedRevision.tools,
                          null,
                          2,
                        )}
                        label="MCP Tools"
                      />
                    )}
                  </>
                ) : viewMode === "proposed" ? (
                  // Proposed View (existing content)
                  <>
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">
                        Name
                      </h4>
                      <p className="text-white">{selectedRevision.name}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-text-primary mb-2">
                        Description
                      </h4>
                      <p className="text-white">
                        {selectedRevision.description}
                      </p>
                    </div>

                    {selectedRevision.prompt && (
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">
                          Prompt
                        </h4>
                        <div className="bg-background-light border border-muted p-3 rounded text-sm">
                          <pre className="whitespace-pre-wrap font-mono text-white">
                            {selectedRevision.prompt}
                          </pre>
                        </div>
                      </div>
                    )}

                    {selectedRevision.instructions &&
                      selectedRevision.instructions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">
                            Context Instructions
                          </h4>
                          <div className="space-y-2">
                            {selectedRevision.instructions.map(
                              (instruction, index) => (
                                <div
                                  key={index}
                                  className="bg-background-light border border-muted p-3 rounded"
                                >
                                  <div className="font-medium text-sm text-white">
                                    {instruction.title}
                                  </div>
                                  <div className="text-sm text-text-primary mt-1">
                                    {instruction.content}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {selectedRevision.tools && (
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">
                          MCP Tools
                        </h4>
                        <div className="bg-background-light border border-muted p-3 rounded text-sm">
                          <pre className="whitespace-pre-wrap font-mono text-white">
                            {JSON.stringify(selectedRevision.tools, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-muted mt-6">
                <button
                  onClick={() => handleReview(selectedRevision._id, "approve")}
                  className="h-10 px-4 text-sm border-none rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReview(selectedRevision._id, "reject")}
                  className="h-10 px-4 text-sm border-none rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedRevision(null)}
                  className="h-10 px-4 text-sm border border-muted rounded bg-background-light text-text-primary hover:border-accent hover:text-accent transition-colors"
                >
                  Back to List
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-text-secondary">
              <div className="text-4xl mb-4">📋</div>
              <p>Select a revision from the list to review it</p>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

// Export with both names for compatibility
export { ReviewPendingModal as ReviewRevisionsModal };
