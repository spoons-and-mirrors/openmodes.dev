import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function useModeOperations() {
  const updateModeStatus = useMutation(api.mutation.updateModeStatus);
  const reviewRevision = useMutation(api.mutation.reviewRevision);

  const approveModeOperation = async (modeId: Id<"modes">) => {
    try {
      await updateModeStatus({ modeId, status: "approved" });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to approve mode",
      };
    }
  };

  const rejectModeOperation = async (modeId: Id<"modes">) => {
    try {
      await updateModeStatus({ modeId, status: "pending" }); // Reset to pending as we don't have "rejected" status for modes
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reject mode",
      };
    }
  };

  const approveRevisionOperation = async (revisionId: Id<"mode_revisions">) => {
    try {
      await reviewRevision({ revisionId, action: "approve" });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to approve revision",
      };
    }
  };

  const rejectRevisionOperation = async (revisionId: Id<"mode_revisions">) => {
    try {
      await reviewRevision({ revisionId, action: "reject" });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to reject revision",
      };
    }
  };

  return {
    approveMode: approveModeOperation,
    rejectMode: rejectModeOperation,
    approveRevision: approveRevisionOperation,
    rejectRevision: rejectRevisionOperation,
  };
}
