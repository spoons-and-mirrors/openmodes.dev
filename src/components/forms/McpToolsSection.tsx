import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Button } from "../ui/button";
import { DebouncedInput } from "./DebouncedInput";

interface McpTool {
  type: "local" | "remote";
  name: string;
  command?: string;
  url?: string;
}

interface McpToolsSectionProps {
  mcpTools: McpTool[];
  onAddTool: () => void;
  onRemoveTool: (index: number) => void;
  onUpdateTool: (index: number, field: string, value: string) => void;
}

export function McpToolsSection({
  mcpTools,
  onAddTool,
  onRemoveTool,
  onUpdateTool,
}: McpToolsSectionProps) {
  return (
    <FormSection
      header={
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary">
              MCP Tools
            </h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onAddTool}
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
              Add MCP Tool
            </Button>
          </div>
          <p className="text-xs text-text-secondary">
            Configure Model Context Protocol tools for this mode
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {mcpTools.map((tool, index) => (
          <div
            key={index}
            className="border border-muted rounded p-4 bg-background-light space-y-3 relative"
          >
            <button
              type="button"
              className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 border border-muted rounded bg-transparent text-text-primary cursor-pointer transition-colors hover:border-accent hover:text-accent"
              onClick={() => onRemoveTool(index)}
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

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Name">
                <DebouncedInput
                  className="w-full h-10 px-3 text-sm border border-muted rounded bg-background text-white focus:outline-none"
                  type="text"
                  placeholder="Tool name"
                  value={tool.name}
                  onChange={(value: string) =>
                    onUpdateTool(index, "name", value)
                  }
                />
              </FormField>

              <FormField label="Type">
                <Select
                  value={tool.type}
                  onValueChange={(value: "local" | "remote") =>
                    onUpdateTool(index, "type", value)
                  }
                >
                  <SelectTrigger className="w-full h-10 text-sm !border-muted !bg-background !text-white hover:!border-brand/50 focus:!border-brand/50 focus:!outline-none focus:!ring-0 focus:!ring-offset-0 data-[state=open]:!border-brand/50 !shadow-none">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="!bg-background !border-muted !text-white z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border shadow-md">
                    <SelectItem
                      value="local"
                      className="!bg-transparent !text-white hover:!bg-background-light focus:!bg-background-light data-[highlighted]:!bg-background-light data-[highlighted]:!text-white cursor-pointer relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none"
                    >
                      Local
                    </SelectItem>
                    <SelectItem
                      value="remote"
                      className="!bg-transparent !text-white hover:!bg-background-light focus:!bg-background-light data-[highlighted]:!bg-background-light data-[highlighted]:!text-white cursor-pointer relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none"
                    >
                      Remote
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Command">
                <DebouncedInput
                  className="w-full h-10 px-3 text-sm border border-muted rounded bg-background text-white focus:outline-none"
                  type="text"
                  placeholder="Command to run"
                  value={tool.command || ""}
                  onChange={(value: string) =>
                    onUpdateTool(index, "command", value)
                  }
                />
              </FormField>

              <FormField label="URL">
                <DebouncedInput
                  className="w-full h-10 px-3 text-sm border border-muted rounded bg-background text-white focus:outline-none"
                  type="text"
                  placeholder="https://example.com (optional)"
                  value={tool.url || ""}
                  onChange={(value: string) =>
                    onUpdateTool(index, "url", value)
                  }
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
