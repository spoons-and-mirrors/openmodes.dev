import { fetchJson } from "../utils/api.js";
import { URLS } from "../utils/config.js";

export async function viewCommand(agentName, { devFlag = false } = {}) {
  try {
    console.log(`🔍 Fetching details for agent: ${agentName}`);

    const baseUrl = devFlag ? URLS.development : URLS.production;
    const url = `${baseUrl}/${agentName}`;
    const agentData = await fetchJson(url);

    // Check for error response from API
    if (agentData.error) {
      console.error(`❌ ${agentData.error}`);
      process.exit(1);
    }

    console.log("\n📋 Agent Details:\n");

    // Inline: name, author, votes, downloads, version
    console.log(
      `${agentData.name} by ${agentData.author} • ${agentData.votes || 0} votes • ${agentData.downloads || 0} downloads • v${agentData.version}`,
    );

    // Last updated
    if (agentData.updated_at) {
      console.log(
        `Last Updated: ${new Date(agentData.updated_at).toLocaleDateString()}`,
      );
    }

    // Description with label on separate line
    if (agentData.description) {
      console.log(`\nDescription: ${agentData.description}`);
    }

    // Model and temperature with robot icon
    if (agentData.model || agentData.temperature) {
      console.log(
        `\n🤖 ${agentData.model || "Unknown model"}${agentData.temperature ? ` • Temperature: ${agentData.temperature}` : ""}`,
      );
    }

    // Tools
    if (agentData.tools) {
      console.log("\n🛠️ Tools:");
      if (
        agentData.tools.tools &&
        Object.keys(agentData.tools.tools).length > 0
      ) {
        console.log("  Built-in tools:");
        Object.entries(agentData.tools.tools).forEach(([tool, enabled]) => {
          console.log(`    ${tool}: ${enabled ? "✅" : "❌"}`);
        });
      }

      if (agentData.tools.mcp_tools && agentData.tools.mcp_tools.length > 0) {
        console.log("  MCP tools:");
        agentData.tools.mcp_tools.forEach((tool) => {
          console.log(`    ${tool.name} (${tool.type})`);
          if (tool.command) {
            const command = Array.isArray(tool.command)
              ? tool.command.join(" ")
              : tool.command;
            console.log(`      Command: ${command}`);
          }
        });
      }
    }

    // Agent prompt (full content, no truncation)
    if (agentData.prompt) {
      console.log("\n💭 Agent Prompt:");
      console.log(agentData.prompt);
    }

    // Instructions
    if (agentData.instructions && agentData.instructions.length > 0) {
      console.log("\n📖 Instructions:");
      agentData.instructions.forEach((instruction, index) => {
        console.log(`  ${index + 1}. ${instruction.content}`);
      });
    }

    // Resources
    if (agentData.resources && agentData.resources.length > 0) {
      console.log("\n📚 Resources:");
      agentData.resources.forEach((resource, index) => {
        if (resource.description) {
          console.log(`  ${index + 1}. Description: ${resource.description}`);
        }
        if (resource.content) {
          console.log(`     Content: ${resource.content}`);
        }
      });
    }

    console.log(`\nInstall with: npx openmodes install ${agentName}`);
  } catch (error) {
    console.error(`❌ Error fetching agent details:`, error.message);
    process.exit(1);
  }
}
