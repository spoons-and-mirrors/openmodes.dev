import fs from "fs";
import path from "path";
import os from "os";
import { createInterface } from "readline";
import { fetchJson } from "../utils/api.js";
import { URLS } from "../utils/config.js";

// Configuration - easily change paths here
const PATHS = {
  local: {
    base: ".opencode",
    agent: "agent",
    prompts: "prompts",
  },
  global: {
    base: path.join(os.homedir(), ".config", "opencode"),
    agent: "agent",
    prompts: "prompts",
  },
};

async function promptUser(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

function sanitizeAgentName(agentName) {
  return agentName.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

function getBasePath(globalFlag) {
  return globalFlag
    ? PATHS.global.base
    : path.join(process.cwd(), PATHS.local.base);
}

function getAgentDir(globalFlag) {
  return path.join(getBasePath(globalFlag), PATHS.local.agent);
}

function getPromptsDir(globalFlag, agentName) {
  return path.join(
    getBasePath(globalFlag),
    PATHS.local.prompts,
    sanitizeAgentName(agentName),
  );
}

function getAgentFilePath(globalFlag, agentName) {
  return path.join(
    getAgentDir(globalFlag),
    `${sanitizeAgentName(agentName)}.md`,
  );
}

function getPromptReference(globalFlag, agentName, filename) {
  const sanitizedAgentName = sanitizeAgentName(agentName);
  return globalFlag
    ? `~/.config/opencode/${PATHS.local.prompts}/${sanitizedAgentName}/${filename}`
    : `./.opencode/${PATHS.local.prompts}/${sanitizedAgentName}/${filename}`;
}

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function installAgent(
  agentName,
  devFlag = false,
  globalFlag = false,
  forceFlag = false,
) {
  try {
    console.log(`📦 Installing agent: ${agentName}`);

    const baseUrl = devFlag ? URLS.development : URLS.production;
    const url = `${baseUrl}/${agentName}`;
    const agentData = await fetchJson(url);

    // Check for error response from API
    if (agentData.error) {
      console.error(`❌ ${agentData.error}`);
      process.exit(1);
    }

    // Check if agent already exists and prompt for confirmation
    const agentFilePath = getAgentFilePath(globalFlag, agentName);
    if (fs.existsSync(agentFilePath) && !forceFlag) {
      const answer = await promptUser(
        `⚠️  Agent "${agentName}" already exists. Overwrite? (y/N): `,
      );
      if (answer !== "y" && answer !== "yes") {
        console.log("Installation cancelled.");
        process.exit(0);
      }
    }

    // Remove URL keys from MCP tools
    let mcp = {};
    if (agentData.tools && Array.isArray(agentData.tools.mcp_tools)) {
      for (const tool of agentData.tools.mcp_tools) {
        const { name, type, command } = tool;
        // Ensure command is an array
        const commandArray = Array.isArray(command)
          ? command
          : command.split(" ");
        mcp[name] = { type, command: commandArray };
      }
    }

    // Write instruction files
    let instructionsArr = [];
    if (Array.isArray(agentData.instructions)) {
      const baseDir = path.join(
        getPromptsDir(globalFlag, agentName),
        "instructions",
      );
      ensureDirectoryExists(baseDir);
      for (const instruction of agentData.instructions) {
        const filename = `${instruction.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
        const instructionPath = path.join(baseDir, filename);
        fs.writeFileSync(instructionPath, instruction.content);
        instructionsArr.push(
          getPromptReference(globalFlag, agentName, `instructions/${filename}`),
        );
      }
    }
    // Write resource files
    let resourcesArr = [];
    if (Array.isArray(agentData.resources)) {
      const baseDir = path.join(
        getPromptsDir(globalFlag, agentName),
        "resources",
      );
      ensureDirectoryExists(baseDir);
      for (const resource of agentData.resources) {
        const filename = `${resource.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
        const resourcePath = path.join(baseDir, filename);
        fs.writeFileSync(resourcePath, resource.content);
        resourcesArr.push({
          path: getPromptReference(
            globalFlag,
            agentName,
            `resources/${filename}`,
          ),
          description: resource.description || "",
        });
      }
    }
    // Compose YAML frontmatter
    const yamlParts = ["---"];

    if (agentData.description) {
      yamlParts.push(`description: ${agentData.description}`);
    }

    if (agentData.model) {
      yamlParts.push(`model: ${agentData.model}`);
    }

    if (agentData.temperature !== undefined) {
      yamlParts.push(`temperature: ${agentData.temperature}`);
    }

    if (
      agentData.tools &&
      agentData.tools.tools &&
      Object.keys(agentData.tools.tools).length > 0
    ) {
      yamlParts.push("tools:");
      Object.entries(agentData.tools.tools).forEach(([k, v]) => {
        yamlParts.push(`  ${k}: ${v}`);
      });
    }

    if (Object.keys(mcp).length > 0) {
      yamlParts.push("mcp:");
      Object.entries(mcp).forEach(([k, v]) => {
        yamlParts.push(`  ${k}:`);
        yamlParts.push(`    type: ${v.type}`);
        yamlParts.push(`    command: ${JSON.stringify(v.command)}`);
      });
    }
    if (instructionsArr.length > 0) {
      yamlParts.push("instructions:");
      instructionsArr.forEach((instruction) => {
        yamlParts.push(`  - "${instruction}"`);
      });
    }
    if (resourcesArr.length > 0) {
      yamlParts.push("resources:");
      resourcesArr.forEach((r) => {
        yamlParts.push(`  - path: "${r.path}"`);
        if (r.description) {
          yamlParts.push(`    description: "${r.description}"`);
        }
      });
    }
    yamlParts.push("---");
    const yamlHeader = yamlParts.join("\n");

    // Write the agent markdown file
    const agentDir = getAgentDir(globalFlag);
    ensureDirectoryExists(agentDir);
    const prompt = agentData.prompt || "";
    fs.writeFileSync(agentFilePath, `${yamlHeader}\n\n${prompt}`);

    console.log(`✅ Successfully installed agent "${agentName}"`);
    console.log(
      `⚠️  Note: This agent may not be fully compatible with opencode yet. Check https://github.com/sst/opencode/pull/1688 for compatibility updates.`,
    );
  } catch (error) {
    console.error(`❌ Error installing agent "${agentName}":`, error.message);
    process.exit(1);
  }
}

export async function installCommand(
  agentNames,
  { devFlag = false, globalFlag = false, forceFlag = false } = {},
) {
  await Promise.all(
    agentNames.map((agentName) =>
      installAgent(agentName, devFlag, globalFlag, forceFlag),
    ),
  );
}
