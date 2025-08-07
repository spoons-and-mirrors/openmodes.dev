#!/usr/bin/env node

import { installCommand } from "./commands/install.js";
import { listCommand } from "./commands/list.js";
import { removeCommand } from "./commands/remove.js";
import { viewCommand } from "./commands/view.js";

const args = process.argv.slice(2);
let command,
  agentNames,
  devFlag = false,
  globalFlag = false,
  forceFlag = false,
  sortBy = null,
  sortOrder = "desc",
  showVersions = false;

// Parse flags
if (args.includes("--dev") || args.includes("-d")) {
  devFlag = true;
}
if (args.includes("-g") || args.includes("--global")) {
  globalFlag = true;
}
if (args.includes("-y") || args.includes("--yes")) {
  forceFlag = true;
}
if (args.includes("--versions") || args.includes("-v")) {
  showVersions = true;
}

// Parse sort flags
const sortByIndex = args.findIndex((arg) => arg === "--sort-by");
if (sortByIndex !== -1 && args[sortByIndex + 1]) {
  const sortValue = args[sortByIndex + 1];
  if (["votes", "downloads", "date", "name"].includes(sortValue)) {
    sortBy = sortValue;
  } else {
    console.error(
      `❌ Invalid sort option: ${sortValue}. Valid options: votes, downloads, date, name`,
    );
    process.exit(1);
  }
}

const sortOrderIndex = args.findIndex((arg) => arg === "--sort-order");
if (sortOrderIndex !== -1 && args[sortOrderIndex + 1]) {
  const orderValue = args[sortOrderIndex + 1];
  if (["asc", "desc"].includes(orderValue)) {
    sortOrder = orderValue;
  } else {
    console.error(
      `❌ Invalid sort order: ${orderValue}. Valid options: asc, desc`,
    );
    process.exit(1);
  }
}

// Filter out flags and their values to get command and agent names
const filteredArgs = args.filter(
  (arg, index) =>
    arg !== "--dev" &&
    arg !== "-d" &&
    arg !== "-g" &&
    arg !== "--global" &&
    arg !== "-y" &&
    arg !== "--yes" &&
    arg !== "--sort-by" &&
    arg !== "--sort-order" &&
    arg !== "--versions" &&
    arg !== "-v" &&
    // Skip the value after --sort-by and --sort-order
    !(args[index - 1] === "--sort-by" || args[index - 1] === "--sort-order"),
);

command = filteredArgs[0];
agentNames = filteredArgs.slice(1);

// Route to appropriate command
if (command === "install" && agentNames.length > 0) {
  await installCommand(agentNames, { devFlag, globalFlag, forceFlag });
} else if (command === "remove" && agentNames.length > 0) {
  await removeCommand(agentNames, { globalFlag });
} else if (command === "list") {
  await listCommand({ devFlag, sortBy, sortOrder, showVersions });
} else if (command === "view" && agentNames.length === 1) {
  await viewCommand(agentNames[0], { devFlag });
} else {
  console.log("Usage: openmodes <command> <agent-name...> [options]");
  console.log("");
  console.log("Commands:");
  console.log(
    "  install <agent-name...> [--dev] [-g|--global] [-y|--yes]  Install one or more agents as .opencode/agent/{agent}.md (or globally) from openmodes.dev or local dev server",
  );
  console.log(
    "  remove <agent-name...> [-g|--global]                      Remove one or more installed agents (local or global)",
  );
  console.log(
    "  list [--dev] [--sort-by <field>] [--sort-order <order>] [--versions]  List all available agents from openmodes.dev",
  );
  console.log(
    "  view <agent-name> [--dev]                                  View detailed information about an agent without installing",
  );
  console.log("");
  console.log("Options:");
  console.log(
    "  --dev, -d              Use development server (localhost:5173)",
  );
  console.log(
    "  -g, --global           Install globally to ~/.config/opencode",
  );
  console.log(
    "  -y, --yes              Overwrite existing agent without confirmation",
  );
  console.log(
    "  --sort-by <field>      Sort by: votes, downloads, date, name (for list command)",
  );
  console.log("  --sort-order <order>   Sort order: asc, desc (default: desc)");
  console.log(
    "  --versions, -v         Show all version numbers instead of latest 5 (for list command)",
  );
  console.log("");
  console.log("Versioning:");
  console.log("  agent-name      Install latest version");
  console.log("  agent-name@1.0  Install specific version");
  console.log("");
  console.log("Examples:");
  console.log("  npx openmodes list");
  console.log("  npx openmodes list --dev");
  console.log("  npx openmodes list --sort-by votes --sort-order desc");
  console.log("  npx openmodes list --versions");
  console.log("  npx openmodes list --sort-by downloads -v");
  console.log("  npx openmodes view archie");
  console.log("  npx openmodes view archie --dev");
  console.log("  npx openmodes install archie@1.4");
  console.log("  npx openmodes install archie mode1 mode2");
  console.log("  npx openmodes install archie --dev -g -y");
  console.log("  npx openmodes remove archie mode1");
  process.exit(1);
}
