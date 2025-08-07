import { useState, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface ToolBadgeInputProps {
  tools: Record<string, boolean>;
  onToolsChange: (tools: Record<string, boolean>) => void;
  className?: string;
}

export function ToolBadgeInput({
  tools,
  onToolsChange,
  className,
}: ToolBadgeInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addTool();
    } else if (e.key === "Backspace" && inputValue === "") {
      // Remove last tool if input is empty and backspace is pressed
      const toolKeys = Object.keys(tools);
      if (toolKeys.length > 0) {
        const lastTool = toolKeys[toolKeys.length - 1];
        const newTools = { ...tools };
        delete newTools[lastTool];
        onToolsChange(newTools);
      }
    }
  };

  const addTool = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !Object.prototype.hasOwnProperty.call(tools, trimmed)) {
      onToolsChange({ ...tools, [trimmed]: false });
      setInputValue("");
    }
  };

  const removeTool = (toolName: string) => {
    const newTools = { ...tools };
    delete newTools[toolName];
    onToolsChange(newTools);
  };

  return (
    <div
      className={cn(
        "border border-muted rounded bg-background-light min-h-10 p-2 focus-within:border-brand/50",
        className,
      )}
    >
      <div className="flex flex-wrap gap-2 items-center">
        {Object.entries(tools).map(([toolName]) => (
          <span
            key={toolName}
            className="relative inline-flex items-center gap-1 px-2 py-1 font-mono text-[13px] rounded bg-accent text-muted"
          >
            {toolName}
            <button
              type="button"
              className="flex items-center justify-center w-4 h-4 border-none rounded-full bg-white/20 text-inherit text-xs font-bold cursor-pointer transition-colors hover:bg-white/30"
              onClick={(e) => {
                e.stopPropagation();
                removeTool(toolName);
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTool}
          placeholder={
            Object.keys(tools).length === 0
              ? "Type tool names and press comma or enter to add them..."
              : ""
          }
          className="border-none bg-transparent text-white text-sm outline-none flex-1 min-w-[120px] p-1 placeholder:text-text-secondary"
        />
      </div>
    </div>
  );
}
