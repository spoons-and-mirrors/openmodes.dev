import fs from "fs";
import path from "path";
import os from "os";

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

export async function removeCommand(agentNames, { globalFlag = false } = {}) {
  agentNames.forEach((agentName) => {
    removeAgent(agentName, globalFlag);
  });
}
