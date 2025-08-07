import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BaseModal } from "../common/BaseModal";
import { FormActions } from "../forms/FormActions";
import { Button } from "../ui/button";
import { BasicInfoSection } from "../forms/BasicInfoSection";
import { ContextInstructionsSection } from "../forms/ContextInstructionsSection";
import { ResourcesSection } from "../forms/ResourcesSection";
import { McpToolsSection } from "../forms/McpToolsSection";
import { useModeFormStore } from "../../lib/stores/modeFormStore";
import { useModalStore } from "../../lib/stores/modalStore";
import { useAutoSave } from "../../hooks";
import { AdminReviewNotificationModal } from "./AdminReviewNotificationModal";

interface SubmitModeModalProps {}

export function SubmitModeModal({}: SubmitModeModalProps) {
  const {
    showSubmitModeModal,
    closeSubmitModeModal,
    showAdminReviewNotificationModal,
    submittedModeName,
    openAdminReviewNotificationModal,
    closeAdminReviewNotificationModal,
  } = useModalStore();
  const createMode = useMutation(api.mutation.createMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use unified form store
  const {
    formData,
    contextInstructions,
    resources,
    mcpTools,
    tools,
    updateFormData,
    updateTools,
    addContextInstruction,
    removeContextInstruction,
    updateContextInstruction,
    addResource,
    removeResource,
    updateResource,
    addMcpTool,
    removeMcpTool,
    updateMcpTool,
    initializeForCreate,
    clearForm,
  } = useModeFormStore();

  // Auto-save form data to localStorage - only when modal is open
  const { saveWithFlush, clearSavedData } = useAutoSave(
    "submitModeFormData",
    5000,
    showSubmitModeModal,
  );

  // Create a wrapped close handler that saves before closing
  const handleClose = () => {
    saveWithFlush();
    closeSubmitModeModal();
  };

  // Memoize the name for the availability check to reduce API calls
  const trimmedName = useMemo(() => formData.name.trim(), [formData.name]);

  // Check name availability for validation - only when name has actual content
  const nameAvailability = useQuery(
    api.query.checkModeNameAvailability,
    trimmedName.length > 0 ? { name: trimmedName } : "skip",
  );

  // Initialize form for create mode when modal opens
  useEffect(() => {
    if (showSubmitModeModal) {
      initializeForCreate();
    }
  }, [showSubmitModeModal, initializeForCreate]);

  // Save on page unload or visibility change
  useEffect(() => {
    const handleUnload = () => {
      if (showSubmitModeModal) {
        saveWithFlush();
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleUnload);
    };
  }, [showSubmitModeModal, saveWithFlush]);

  if (!showSubmitModeModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if name is available before submitting
    if (nameAvailability === false) {
      alert("Mode name is already taken. Please choose a different name.");
      return;
    }

    if (!nameAvailability) {
      alert("Please wait for name availability check to complete.");
      return;
    }

    // Show confirmation dialog instead of submitting directly
    openAdminReviewNotificationModal(formData.name);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      await createMode({
        name: formData.name,
        author: formData.author,
        description: formData.description,
        prompt: formData.mode_prompt,
        version: "1.0",
        instructions: contextInstructions.filter(
          (inst) => inst.title && inst.content,
        ),
        resources: resources.filter(
          (resource) => resource.title && resource.content,
        ),
        temperature: formData.temperature || undefined,
        model: formData.model || undefined,
        mcp_tools: mcpTools.filter((tool) => tool.name),
        tools: tools,
      });

      // Clear form data from store and localStorage on successful submission
      clearForm();
      clearSavedData();
      closeAdminReviewNotificationModal();
      closeSubmitModeModal();
    } catch (error) {
      console.error("Failed to create mode:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const actions = (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
    >
      <FormActions align="right">
        <Button
          type="button"
          variant="secondary"
          onClick={handleClose}
          className="text-text-primary"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          disabled={
            isSubmitting ||
            nameAvailability === false ||
            nameAvailability === undefined
          }
        >
          {isSubmitting ? "Creating..." : "Create Mode"}
        </Button>
      </FormActions>
    </form>
  );

  // Generate dynamic title and subtitle based on form data
  const getModalHeader = () => {
    const name = formData.name?.trim();
    const author = formData.author?.trim();

    if (!name && !author) {
      return { title: "New Agent", subtitle: undefined };
    }

    if (name && author) {
      return {
        title: name.charAt(0).toUpperCase() + name.slice(1),
        subtitle: `by ${author}`,
      };
    }

    if (name) {
      return {
        title: name.charAt(0).toUpperCase() + name.slice(1),
        subtitle: undefined,
      };
    }

    return {
      title: "New Agent",
      subtitle: `by ${author}`,
    };
  };

  const { title, subtitle } = getModalHeader();

  return (
    <>
      <BaseModal
        isOpen={showSubmitModeModal}
        onClose={handleClose}
        title={title}
        subtitle={subtitle}
        maxWidth="4xl"
        actions={actions}
      >
        {" "}
        <div className="pl-6 pr-4 pt-2 pb-6 space-y-8">
          <BasicInfoSection
            formData={formData}
            tools={tools}
            onInputChange={updateFormData}
            onToolsChange={updateTools}
            disabledFields={[]}
          />

          <ContextInstructionsSection
            contextInstructions={contextInstructions}
            onAddInstruction={addContextInstruction}
            onRemoveInstruction={removeContextInstruction}
            onUpdateInstruction={updateContextInstruction}
          />

          <ResourcesSection
            resources={resources}
            onAddResource={addResource}
            onRemoveResource={removeResource}
            onUpdateResource={updateResource}
          />

          <McpToolsSection
            mcpTools={mcpTools}
            onAddTool={addMcpTool}
            onRemoveTool={removeMcpTool}
            onUpdateTool={updateMcpTool}
          />
        </div>
      </BaseModal>

      <AdminReviewNotificationModal
        isOpen={showAdminReviewNotificationModal}
        onClose={closeAdminReviewNotificationModal}
        onConfirm={handleConfirmSubmit}
        modeName={submittedModeName}
      />
    </>
  );
}
