#!/usr/bin/env node

import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import os from "os";
import { createInterface } from "readline";

// Configuration - easily change paths here
const PATHS = {
  local: {
    base: ".opencode",
    agent: "mode",
    prompts: "prompts",
  },
  global: {
    base: path.join(os.homedir(), ".config", "opencode"),
    agent: "mode",
    prompts: "prompts",
  },
};

const URLS = {
  production: "https://openmodes.dev/api",
  development: "http://localhost:5173/api",
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

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https://") ? https : http;
    client
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
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
  } catch (error) {
    console.error(`❌ Error installing agent "${agentName}":`, error.message);
    process.exit(1);
  }
}

function removeAgent(agentName, globalFlag = false) {
  try {
    console.log(`🗑️  Removing agent: ${agentName}`);

    const agentFilePath = getAgentFilePath(globalFlag, agentName);
    const promptsDir = getPromptsDir(globalFlag, agentName);

    if (fs.existsSync(agentFilePath)) {
      fs.rmSync(agentFilePath, { force: true });
    }
    if (fs.existsSync(promptsDir)) {
      fs.rmSync(promptsDir, { recursive: true, force: true });
    }

    console.log(`✅ Successfully removed agent "${agentName}"`);
  } catch (error) {
    console.error(`❌ Error removing agent "${agentName}":`, error.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
let command,
  agentNames,
  devFlag = false,
  globalFlag = false,
  forceFlag = false;

// Support both: openmodes install <agent-name> --dev --global and any order
if (args.includes("--dev") || args.includes("-d")) {
  devFlag = true;
}
if (args.includes("-g") || args.includes("--global")) {
  globalFlag = true;
}
if (args.includes("-y") || args.includes("--yes")) {
  forceFlag = true;
}
const filteredArgs = args.filter(
  (arg) =>
    arg !== "--dev" &&
    arg !== "-d" &&
    arg !== "-g" &&
    arg !== "--global" &&
    arg !== "-y" &&
    arg !== "--yes",
);
command = filteredArgs[0];
agentNames = filteredArgs.slice(1);

if (command === "install" && agentNames.length > 0) {
  await Promise.all(
    agentNames.map((agentName) =>
      installAgent(agentName, devFlag, globalFlag, forceFlag),
    ),
  );
} else if (command === "remove" && agentNames.length > 0) {
  agentNames.forEach((agentName) => {
    removeAgent(agentName, globalFlag);
  });
} else {
  console.log(
    "Usage: openmodes <command> <agent-name...> [--dev] [-g|--global] [-y|--yes]",
  );
  console.log("");
  console.log("Commands:");
  console.log(
    "  install <agent-name...> [--dev] [-g|--global] [-y|--yes]  Install one or more agents as .opencode/agent/{agent}.md (or globally) from openmodes.dev or local dev server",
  );
  console.log(
    "  remove <agent-name...> [-g|--global]                      Remove one or more installed agents (local or global)",
  );
  console.log("");
  console.log("Options:");
  console.log("  --dev, -d      Use development server (localhost:5173)");
  console.log("  -g, --global   Install globally to ~/.config/opencode");
  console.log("  -y, --yes      Overwrite existing agent without confirmation");
  console.log("");
  console.log("Versioning:");
  console.log("  agent-name      Install latest version");
  console.log("  agent-name@1.0  Install specific version");
  console.log("");
  console.log("Examples:");
  console.log("  npx openmodes install archie@1.4");
  console.log("  npx openmodes install archie mode1 mode2");
  console.log("  npx openmodes install archie --dev -g -y");
  console.log("  npx openmodes remove archie mode1");
  process.exit(1);
}
