import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FormField } from "./FormField";
import { FormSection } from "./FormSection";
import { ToolBadgeInput } from "./ToolBadgeInput";
import { ModelSelect } from "../ui/model-select";
import { DebouncedInput } from "./DebouncedInput";

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
  // Memoize disabled fields check for stability
  const isNameDisabled = useMemo(
    () => disabledFields.includes("name"),
    [disabledFields],
  );

  // Check name availability - this will be triggered by the debounced onChange
  const nameAvailability = useQuery(
    api.query.checkModeNameAvailability,
    formData.name.trim() && !isNameDisabled
      ? { name: formData.name.trim() }
      : "skip",
  );

  // Memoize the status calculation to prevent unnecessary re-computations
  const nameStatus = useMemo(() => {
    if (!formData.name.trim() || isNameDisabled) {
      return { className: "", message: "" };
    }

    if (nameAvailability === undefined) {
      return {
        className: "border-yellow-500",
        message: "Checking availability...",
      };
    }

    if (nameAvailability === true) {
      return {
        className: "border-green-500",
        message: "✓ Name is available",
      };
    }

    if (nameAvailability === false) {
      return {
        className: "border-red-500",
        message: "✗ Name is already taken",
      };
    }

    return { className: "", message: "" };
  }, [formData.name, isNameDisabled, nameAvailability]);
  // Memoize the input className to prevent re-computations
  const nameInputClassName = useMemo(() => {
    const baseClasses =
      "w-full h-10 px-3 text-sm border rounded bg-background text-white focus:border-accent/50 focus:outline-none";
    const disabledClasses = isNameDisabled
      ? "opacity-60 cursor-not-allowed"
      : "";
    const statusClasses = nameStatus.className || "border-muted";

    return `${baseClasses} ${disabledClasses} ${statusClasses}`.trim();
  }, [isNameDisabled, nameStatus.className]);

  return (
    <FormSection>
      <div className="space-y-4">
        {/* Basic Details Card */}
        <div className="border border-muted rounded p-4 bg-background-light space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Agent Name" htmlFor="name" required>
              <DebouncedInput
                className={nameInputClassName}
                id="name"
                type="text"
                value={formData.name}
                onChange={(value: string) => onInputChange("name", value)}
                placeholder="Enter mode name"
                required
                disabled={isNameDisabled}
              />
              {nameStatus.message && (
                <p
                  className={`mt-1 text-xs ${nameAvailability === true ? "text-green-500" : nameAvailability === false ? "text-red-500" : "text-yellow-500"}`}
                >
                  {nameStatus.message}
                </p>
              )}
            </FormField>

            <FormField label="Author" htmlFor="author" required>
              <DebouncedInput
                className="w-full h-10 px-3 text-sm border border-muted rounded bg-background text-white focus:outline-none"
                id="author"
                type="text"
                value={formData.author}
                onChange={(value: string) => onInputChange("author", value)}
                placeholder="The agent's author name"
                required
              />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="description" required>
            <DebouncedInput
              className="w-full h-10 px-3 text-sm border border-muted rounded bg-background text-white focus:outline-none"
              id="description"
              type="text"
              value={formData.description}
              onChange={(value: string) => onInputChange("description", value)}
              placeholder="Brief description of the mode..."
              required
            />
          </FormField>
        </div>

        {/* Mode Prompt Card */}
        <div className="border border-muted rounded p-4 bg-background-light space-y-3">
          <FormField label="System Prompt" htmlFor="mode_prompt" required>
            <DebouncedInput
              className="w-full px-3 py-2 text-sm border border-muted rounded bg-background text-white focus:outline-none resize-y min-h-[150px]"
              id="mode_prompt"
              value={formData.mode_prompt}
              onChange={(value: string) => onInputChange("mode_prompt", value)}
              placeholder="The main prompt powering the agent's behavior..."
              rows={6}
              required
            />
          </FormField>
        </div>

        {/* Model Configuration Card */}
        <div className="border border-muted rounded p-4 bg-background-light space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Model" htmlFor="model">
              <ModelSelect
                value={formData.model || ""}
                onValueChange={(value) => onInputChange("model", value)}
                placeholder="Select a model (optional)"
                className="bg-background hover:bg-background"
              />
            </FormField>

            <FormField label="Temperature" htmlFor="temperature">
              <DebouncedInput
                className="w-full h-10 px-3 text-sm border border-muted rounded bg-background text-white focus:outline-none"
                id="temperature"
                type="text"
                value={formData.temperature || ""}
                onChange={(value: string) =>
                  onInputChange("temperature", value)
                }
                placeholder="Model temperature (0.0-2.0, optional)"
              />
            </FormField>
          </div>
        </div>

        {/* Tools Configuration Card */}
        <div className="border border-muted rounded p-4 bg-background-light space-y-3">
          <FormField label="Disabled Tools">
            <ToolBadgeInput
              tools={tools}
              onToolsChange={onToolsChange}
              className="bg-background focus:border-brand/50"
            />
          </FormField>
        </div>
      </div>
    </FormSection>
  );
}
