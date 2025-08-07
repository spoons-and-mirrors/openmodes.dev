import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Button } from "../ui/button";
import { DebouncedInput } from "./DebouncedInput";

interface ContextInstruction {
  title: string;
  content: string;
}

interface ContextInstructionsSectionProps {
  contextInstructions: ContextInstruction[];
  onAddInstruction: () => void;
  onRemoveInstruction: (index: number) => void;
  onUpdateInstruction: (index: number, field: string, value: string) => void;
}

export function ContextInstructionsSection({
  contextInstructions,
  onAddInstruction,
  onRemoveInstruction,
  onUpdateInstruction,
}: ContextInstructionsSectionProps) {
  return (
    <FormSection
      header={
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-text-primary font-semibold">
              Context Instructions
            </h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onAddInstruction}
              className="text-text-primary"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Instruction
            </Button>
          </div>
          <p className="text-xs text-text-secondary">
            Define specific instructions that provide additional context for
            this mode
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {contextInstructions.map((instruction, index) => (
          <div
            key={index}
            className="border border-muted rounded p-4 bg-background-light space-y-3 relative"
          >
            <button
              type="button"
              className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 border border-muted rounded bg-transparent text-text-primary cursor-pointer transition-colors hover:border-brand/50 hover:text-brand/50"
              onClick={() => onRemoveInstruction(index)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <FormField label="Title">
              <DebouncedInput
                className="w-full h-10 px-3 text-sm border border-muted rounded bg-background text-white focus:outline-none focus:border-brand/50"
                type="text"
                placeholder="Instruction title"
                value={instruction.title}
                onChange={(value: string) =>
                  onUpdateInstruction(index, "title", value)
                }
              />
            </FormField>

            <FormField label="Content">
              <DebouncedInput
                className="w-full px-2.5 py-2 text-sm border border-muted rounded bg-background text-white focus:border-brand/50 focus:outline-none resize-y min-h-[80px]"
                placeholder="Instruction content"
                value={instruction.content}
                onChange={(value: string) =>
                  onUpdateInstruction(index, "content", value)
                }
                rows={3}
              />
            </FormField>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
