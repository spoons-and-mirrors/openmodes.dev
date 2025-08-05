import { FormField } from "./FormField";
import { FormSection } from "./FormSection";
import { ToolBadgeInput } from "./ToolBadgeInput";

interface BasicInfoSectionProps {
  formData: {
    name: string;
    description: string;
    mode_prompt: string;
    author: string;
    temperature?: string;
    model?: string;
  };
  tools: Record<string, boolean>;
  onInputChange: (field: string, value: string) => void;
  onToolsChange: (tools: Record<string, boolean>) => void;
  disabledFields?: string[]; // Optional array of field names to disable
}

export function BasicInfoSection({
  formData,
  tools,
  onInputChange,
  onToolsChange,
  disabledFields = [],
}: BasicInfoSectionProps) {
  return (
    <FormSection
      title="Basic Information"
      description="Provide the basic details for your mode"
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Mode Name" htmlFor="name" required>
          <input
            className={`w-full h-10 px-3 text-sm border border-muted rounded bg-background-light text-white focus:border-accent focus:outline-none ${disabledFields.includes("name") ? "opacity-60 cursor-not-allowed" : ""}`}
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            placeholder="Enter mode name"
            required
            disabled={disabledFields.includes("name")}
          />
        </FormField>

        <FormField label="Author" htmlFor="author" required>
          <input
            className="w-full h-10 px-3 text-sm border border-muted rounded bg-background-light text-white focus:border-accent focus:outline-none"
            id="author"
            type="text"
            value={formData.author}
            onChange={(e) => onInputChange("author", e.target.value)}
            placeholder="Your GitHub handle or nickname"
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Temperature"
          htmlFor="temperature"
          description="Model temperature (0.0-2.0, optional)"
        >
          <input
            className="w-full h-10 px-3 text-sm border border-muted rounded bg-background-light text-white focus:border-accent focus:outline-none"
            id="temperature"
            type="text"
            value={formData.temperature || ""}
            onChange={(e) => onInputChange("temperature", e.target.value)}
            placeholder="e.g., 0.7"
          />
        </FormField>

        <FormField
          label="Model"
          htmlFor="model"
          description="Preferred model (optional)"
        >
          <input
            className="w-full h-10 px-3 text-sm border border-muted rounded bg-background-light text-white focus:border-accent focus:outline-none"
            id="model"
            type="text"
            value={formData.model || ""}
            onChange={(e) => onInputChange("model", e.target.value)}
            placeholder="e.g., gpt-4o, claude-3.5-sonnet"
          />
        </FormField>
      </div>

      <FormField
        label="Description"
        htmlFor="description"
        required
        description="Brief description of what this mode does"
      >
        <textarea
          className="w-full px-3 py-2 text-sm border border-muted rounded bg-background-light text-white focus:border-accent focus:outline-none resize-y min-h-[80px]"
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Brief description of the mode..."
          rows={3}
          required
        />
      </FormField>

      <FormField
        label="Mode Prompt"
        htmlFor="mode_prompt"
        required
        description="The main system prompt that defines this mode's behavior"
      >
        <textarea
          className="w-full px-3 py-2 text-sm border border-muted rounded bg-background-light text-white focus:border-accent focus:outline-none resize-y min-h-[150px]"
          id="mode_prompt"
          value={formData.mode_prompt}
          onChange={(e) => onInputChange("mode_prompt", e.target.value)}
          placeholder="Enter the main prompt for this mode..."
          rows={6}
          required
        />
      </FormField>

      <FormField
        label="Disabled Tools"
        description="Type tool names and press comma or enter to add them."
      >
        <ToolBadgeInput tools={tools} onToolsChange={onToolsChange} />
      </FormField>
    </FormSection>
  );
}
