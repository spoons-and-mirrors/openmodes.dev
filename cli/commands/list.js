import { fetchJson } from "../utils/api.js";
import { URLS } from "../utils/config.js";

function sortModes(modes, sortBy, sortOrder = "desc") {
  return modes.sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case "votes":
        aVal = a.votes || 0;
        bVal = b.votes || 0;
        break;
      case "downloads":
        aVal = a.downloads || 0;
        bVal = b.downloads || 0;
        break;
      case "date":
        aVal = new Date(a.updated_at || 0).getTime();
        bVal = new Date(b.updated_at || 0).getTime();
        break;
      case "name":
        aVal = a.name || "";
        bVal = b.name || "";
        break;
      default:
        return 0;
    }

    let comparison = 0;
    if (typeof aVal === "string" && typeof bVal === "string") {
      comparison = aVal.localeCompare(bVal);
    } else {
      comparison = aVal - bVal;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });
}

export async function listCommand({
  devFlag = false,
  sortBy = null,
  sortOrder = "desc",
  showVersions = false,
} = {}) {
  try {
    console.log("📋 Fetching available agents...");

    const baseUrl = devFlag ? URLS.development : URLS.production;
    const url = `${baseUrl}/index`;
    const indexData = await fetchJson(url);

    // Check for error response from API
    if (indexData.error) {
      console.error(`❌ ${indexData.error}`);
      process.exit(1);
    }

    if (!Array.isArray(indexData) || indexData.length === 0) {
      console.log("No agents available.");
      return;
    }

    // Sort if requested
    let sortedData = indexData;
    if (sortBy) {
      sortedData = sortModes([...indexData], sortBy, sortOrder);
    }

    console.log("\n🤖 Available agents:\n");

    let hasMoreVersionsFlag = false;

    sortedData.forEach((mode) => {
      // First line: Name, Author, Votes, Downloads, Versions
      const nameVersion = `${mode.name}${mode.version ? `@${mode.version}` : ""}`;
      const parts = [`Name: ${nameVersion}`];

      if (mode.author) {
        parts.push(`Author: ${mode.author}`);
      }
      if (mode.votes !== undefined) {
        parts.push(`Votes: ${mode.votes}`);
      }
      if (mode.downloads !== undefined) {
        parts.push(`Downloads: ${mode.downloads}`);
      }

      // Handle versions display
      if (mode.versions !== undefined) {
        if (Array.isArray(mode.versions)) {
          if (mode.versions.length > 5) {
            hasMoreVersionsFlag = true;
            if (showVersions) {
              // Show all versions
              parts.push(`Versions: ${mode.versions.join(", ")}`);
            } else {
              // Show only latest 5 versions
              const latest5 = mode.versions.slice(-5);
              parts.push(
                `Versions: ${latest5.join(", ")}... (+${mode.versions.length - 5} older)`,
              );
            }
          } else {
            // 5 or fewer versions, show them all
            parts.push(`Versions: ${mode.versions.join(", ")}`);
          }
        } else {
          // Fallback for old API response format
          parts.push(`Versions: ${mode.versions}`);
        }
      }

      console.log(parts.join(" | "));

      // Second line: Description
      if (mode.description) {
        console.log(`   Description: ${mode.description}`);
      }

      console.log("");
    });

    console.log(`Found ${sortedData.length} available agents.`);
    if (sortBy) {
      console.log(`Sorted by ${sortBy} (${sortOrder}ending order)`);
    }
    if (hasMoreVersionsFlag && !showVersions) {
      console.log("Use the --versions flag (-v) to see older versions");
    }
    console.log("\nInstall with: npx openmodes install <agent-name>");
  } catch (error) {
    console.error(`❌ Error fetching agent list:`, error.message);
    process.exit(1);
  }
}
