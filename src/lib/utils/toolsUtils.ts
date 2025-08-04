export interface ParsedTools {
  mcpTools: Array<{ name: string; url?: string }>;
  disabledTools: string[];
}

export function parseTools(toolsConfig: any): ParsedTools {
  const mcpTools: Array<{ name: string; url?: string }> = [];
  const disabledTools: string[] = [];

  if (!toolsConfig) return { mcpTools, disabledTools };

  // Parse MCP tools
  if (toolsConfig.mcp_tools && Array.isArray(toolsConfig.mcp_tools)) {
    toolsConfig.mcp_tools.forEach((tool: any) => {
      mcpTools.push({
        name: tool.name,
        url: tool.url ? tool.url.replace(/^\"|\"$/g, "") : undefined, // Remove quotes from URL
      });
    });
  }

  // Parse disabled tools
  if (toolsConfig.tools) {
    Object.entries(toolsConfig.tools).forEach(([tool, enabled]) => {
      if (enabled === false) {
        disabledTools.push(tool);
      }
    });
  }

  return { mcpTools, disabledTools };
}

export function titleCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
