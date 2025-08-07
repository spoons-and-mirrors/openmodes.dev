interface Tool {
  name: string;
  url?: string;
}

interface ToolsListProps {
  tools: Tool[];
  title: string;
  variant?: "mcp" | "disabled";
  className?: string;
}

export function ToolsList({
  tools,
  title,
  variant = "mcp",
  className = "",
}: ToolsListProps) {
  if (tools.length === 0) return null;

  const getToolClasses = () => {
    const baseClasses =
      "relative inline-block py-2 px-3 font-mono text-[13px] no-underline rounded bg-[#111] text-text-primary transition-all duration-200";

    if (variant === "disabled") {
      return `${baseClasses} hover:bg-accent/30 hover:text-text-primary after:content-[''] after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:rounded-full after:border after:border-background after:bg-red-400/30`;
    }

    return `${baseClasses} cursor-pointer hover:bg-accent hover:text-muted hover:-translate-y-px after:content-[''] after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:rounded-full after:border after:border-background after:bg-accent`;
  };

  return (
    <div className={className}>
      <h4 className="m-0 mb-3 text-sm font-semibold text-text-primary">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => {
          const toolName = typeof tool === "string" ? tool : tool.name;
          const toolUrl =
            typeof tool === "object" && tool.url ? tool.url : null;

          const classes = getToolClasses();

          return toolUrl ? (
            <a
              key={toolName}
              href={toolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={classes}
            >
              {toolName}
            </a>
          ) : (
            <span key={toolName} className={classes}>
              {toolName}
            </span>
          );
        })}
      </div>
    </div>
  );
}
