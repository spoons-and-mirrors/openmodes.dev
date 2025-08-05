#!/usr/bin/env node

import fs from "fs";
import path from "path";
import http from "http";
import https from "https";

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

async function installMode(modeId, devFlag = false, globalFlag = false) {
  try {
    console.log(`📦 Installing mode: ${modeId}`);

    const url = devFlag
      ? `http://localhost:5173/api/${modeId}`
      : `https://openmodes.dev/api/${modeId}`;
    const modeData = await fetchJson(url);

    // Remove URL keys from MCP tools
    let mcp = {};
    if (modeData.tools && Array.isArray(modeData.tools.mcp_tools)) {
      for (const tool of modeData.tools.mcp_tools) {
        const { name, type, command } = tool;
        mcp[name] = { type, command };
      }
    }

    // Write instruction files
    let instructionsArr = [];
    if (Array.isArray(modeData.instructions)) {
      const baseDir = globalFlag
        ? path.join(
            require("os").homedir(),
            ".config",
            "opencode",
            "instructions",
            modeId,
          )
        : path.join(process.cwd(), ".opencode", "instructions", modeId);
      ensureDirectoryExists(baseDir);
      for (const instruction of modeData.instructions) {
        const filename = `${instruction.title.toLowerCase()}.instructions.md`;
        const instructionPath = path.join(baseDir, filename);
        fs.writeFileSync(instructionPath, instruction.content);
        instructionsArr.push({
          file: globalFlag
            ? `~/.config/opencode/instructions/${modeId}/${filename}`
            : `./.opencode/instructions/${modeId}/${filename}`,
        });
      }
    }

    // Compose YAML frontmatter
    const yamlHeader = [
      "---",
      modeData.model ? `model: ${modeData.model}` : "",
      modeData.temperature !== undefined
        ? `temperature: ${modeData.temperature}`
        : "",
      modeData.tools && modeData.tools.tools
        ? "tools:\n" +
          Object.entries(modeData.tools.tools)
            .map(([k, v]) => `  ${k}: ${v}`)
            .join("\n")
        : "",
      Object.keys(mcp).length > 0
        ? "mcp:\n" +
          Object.entries(mcp)
            .map(
              ([k, v]) =>
                `  ${k}:\n    type: ${v.type}\n    command: ${v.command}`,
            )
            .join("\n")
        : "",
      instructionsArr.length > 0
        ? "instructions:\n" +
          instructionsArr.map((i) => `  - file: ${i.file}`).join("\n")
        : "",
      "---",
    ]
      .filter(Boolean)
      .join("\n");

    // Write the mode markdown file
    const modeDir = globalFlag
      ? path.join(require("os").homedir(), ".config", "opencode", "mode")
      : path.join(process.cwd(), ".opencode", "mode");
    ensureDirectoryExists(modeDir);
    const modeFilePath = path.join(modeDir, `${modeId}.md`);
    const prompt = modeData.prompt || "";
    fs.writeFileSync(modeFilePath, `${yamlHeader}\n\n${prompt}`);

    console.log(`✅ Successfully installed mode "${modeId}"`);
  } catch (error) {
    console.error(`❌ Error installing mode "${modeId}":`, error.message);
    process.exit(1);
  }
}

function removeMode(modeId, globalFlag = false) {
  try {
    console.log(`🗑️  Removing mode: ${modeId}`);

    const modeFilePath = globalFlag
      ? path.join(
          require("os").homedir(),
          ".config",
          "opencode",
          "mode",
          `${modeId}.md`,
        )
      : path.join(process.cwd(), ".opencode", "mode", `${modeId}.md`);

    const instructionsDir = globalFlag
      ? path.join(
          require("os").homedir(),
          ".config",
          "opencode",
          "instructions",
          modeId,
        )
      : path.join(process.cwd(), ".opencode", "instructions", modeId);

    if (fs.existsSync(modeFilePath)) {
      fs.rmSync(modeFilePath, { force: true });
    }
    if (fs.existsSync(instructionsDir)) {
      fs.rmSync(instructionsDir, { recursive: true, force: true });
    }

    console.log(`✅ Successfully removed mode "${modeId}"`);
  } catch (error) {
    console.error(`❌ Error removing mode "${modeId}":`, error.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
let command,
  modeId,
  devFlag = false,
  globalFlag = false;

// Support both: openmodes install <mode-name> --dev --global and any order
if (args.includes("--dev")) {
  devFlag = true;
}
if (args.includes("-g") || args.includes("--global")) {
  globalFlag = true;
}
const filteredArgs = args.filter(
  (arg) => arg !== "--dev" && arg !== "-g" && arg !== "--global",
);
command = filteredArgs[0];
modeId = filteredArgs[1];

if (command === "install" && modeId) {
  installMode(modeId, devFlag, globalFlag);
} else if (command === "remove" && modeId) {
  removeMode(modeId, globalFlag);
} else {
  console.log("Usage: openmodes <command> <mode-name> [--dev] [-g|--global]");
  console.log("");
  console.log("Commands:");
  console.log(
    "  install <mode-name> [--dev] [-g|--global]  Install a mode as .opencode/mode/{mode}.md (or globally) from openmodes.dev or local dev server",
  );
  console.log(
    "  remove <mode-name> [-g|--global]           Remove an installed mode (local or global)",
  );
  console.log("");
  console.log("Examples:");
  console.log("  npx openmodes install archie");
  console.log("  npx openmodes install archie --dev");
  console.log("  npx openmodes install archie -g");
  console.log("  npx openmodes remove archie");
  process.exit(1);
}
