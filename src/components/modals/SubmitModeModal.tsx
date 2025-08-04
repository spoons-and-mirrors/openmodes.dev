import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BaseModal } from "../common/BaseModal";
import { FormActions } from "../forms/FormActions";
import { Button } from "../ui/button";
import { BasicInfoSection } from "../forms/BasicInfoSection";
import { ContextInstructionsSection } from "../forms/ContextInstructionsSection";
import { McpToolsSection } from "../forms/McpToolsSection";
import { useModeFormStore } from "../../lib/stores/modeFormStore";
import { useModalStore } from "../../lib/stores/modalStore";

interface SubmitModeModalProps {}

export function SubmitModeModal({}: SubmitModeModalProps) {
  const { showSubmitModeModal, closeSubmitModeModal } = useModalStore();
  const createMode = useMutation(api.mutation.createMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use unified form store
  const {
    formData,
    contextInstructions,
    mcpTools,
    tools,
    updateFormData,
    updateTools,
    addContextInstruction,
    removeContextInstruction,
    updateContextInstruction,
    addMcpTool,
    removeMcpTool,
    updateMcpTool,
    initializeForCreate,
    clearForm,
  } = useModeFormStore();

  // Initialize form for create mode when modal opens
  useEffect(() => {
    if (showSubmitModeModal) {
      initializeForCreate();
    }
  }, [showSubmitModeModal, initializeForCreate]);

  if (!showSubmitModeModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        mcp_tools: mcpTools.filter((tool) => tool.name),
        tools: tools,
      });

      // Clear form data from store and localStorage on successful submission
      clearForm();
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
          onClick={closeSubmitModeModal}
          className="text-text-primary"
        >
          Cancel
        </Button>
        <Button type="submit" variant="default" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Mode"}
        </Button>
      </FormActions>
    </form>
  );

  return (
    <BaseModal
      isOpen={showSubmitModeModal}
      onClose={closeSubmitModeModal}
      title="Submit New Mode"
      maxWidth="4xl"
      actions={actions}
    >
      <div className="p-6 space-y-8">
        <BasicInfoSection
          formData={formData}
          tools={tools}
          onInputChange={updateFormData}
          onToolsChange={updateTools}
        />

        <ContextInstructionsSection
          contextInstructions={contextInstructions}
          onAddInstruction={addContextInstruction}
          onRemoveInstruction={removeContextInstruction}
          onUpdateInstruction={updateContextInstruction}
        />

        <McpToolsSection
          mcpTools={mcpTools}
          onAddTool={addMcpTool}
          onRemoveTool={removeMcpTool}
          onUpdateTool={updateMcpTool}
        />
      </div>
    </BaseModal>
  );
}
