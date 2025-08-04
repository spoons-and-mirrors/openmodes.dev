import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BaseModal } from "../common/BaseModal";
import { FormActions } from "../forms/FormActions";
import { Button } from "../ui/button";
import { FormSection } from "../forms/FormSection";
import { FormField } from "../forms/FormField";
import { BasicInfoSection } from "../forms/BasicInfoSection";
import { ContextInstructionsSection } from "../forms/ContextInstructionsSection";
import { McpToolsSection } from "../forms/McpToolsSection";
import { useModalStore } from "../../lib/stores/modalStore";
import { useModeFormStore } from "../../lib/stores/modeFormStore";

interface EditModeModalProps {}

export function EditModeModal({}: EditModeModalProps) {
  const { showEditModeModal, selectedModeId, closeEditModeModal } =
    useModalStore();

  // Get the selected mode data
  const mode = useQuery(
    api.query.getMode,
    showEditModeModal && selectedModeId ? { modeId: selectedModeId } : "skip",
  );

  const createRevision = useMutation(api.mutation.createRevision);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use unified form store
  const {
    formData,
    contextInstructions,
    mcpTools,
    tools,
    changeSummary,
    updateFormData,
    updateTools,
    addContextInstruction,
    removeContextInstruction,
    updateContextInstruction,
    addMcpTool,
    removeMcpTool,
    updateMcpTool,
    updateChangeSummary,
    initializeForEdit,
  } = useModeFormStore();

  // Update form data when mode changes
  useEffect(() => {
    if (mode && showEditModeModal) {
      initializeForEdit(mode);
    }
  }, [mode, showEditModeModal, initializeForEdit]);

  if (!showEditModeModal || !mode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeSummary.trim()) {
      alert("Please provide a summary of your changes");
      return;
    }

    setIsSubmitting(true);

    try {
      await createRevision({
        original_mode_id: mode._id,
        name: formData.name,
        description: formData.description,
        prompt: formData.mode_prompt,
        instructions: contextInstructions.filter(
          (inst: any) => inst.title && inst.content,
        ),
        mcp_tools: mcpTools.filter((tool: any) => tool.name),
        tools: tools,
        change_summary: changeSummary,
        parent_version: mode.version,
      });

      closeEditModeModal();
    } catch (error) {
      console.error("Failed to create revision:", error);
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
        <Button type="button" variant="secondary" onClick={closeEditModeModal}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting || !changeSummary.trim()}
        >
          {isSubmitting ? "Creating Revision..." : "Create Revision"}
        </Button>
      </FormActions>
    </form>
  );

  return (
    <BaseModal
      isOpen={showEditModeModal}
      onClose={closeEditModeModal}
      title={`Edit "${mode.name}"`}
      maxWidth="4xl"
      actions={actions}
    >
      <div className="p-6 space-y-6">
        <FormSection
          title="Change Summary"
          description="Describe what changes you're making to this mode"
        >
          <FormField
            label="Summary of Changes"
            required
            description="This will help moderators understand your revision"
          >
            <textarea
              className="w-full px-3 py-2 text-sm border border-muted rounded bg-background-light text-white focus:border-accent focus:outline-none resize-y min-h-[80px]"
              value={changeSummary}
              onChange={(e) => updateChangeSummary(e.target.value)}
              placeholder="Describe your changes..."
              rows={3}
              required
            />
          </FormField>
        </FormSection>

        <BasicInfoSection
          formData={formData}
          tools={tools}
          onInputChange={updateFormData}
          onToolsChange={updateTools}
          disabledFields={["author"]}
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
