import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// API endpoint to get modes index (basic metadata only)
http.route({
  path: "/api/index",
  method: "GET",
  handler: httpAction(async (ctx, _request) => {
    try {
      const modes = await ctx.runQuery(api.query.listModes, {});

      // Return basic metadata for index with version information
      const indexData = await Promise.all(
        modes.map(async (mode) => {
          // Get all versions for this specific mode by name
          const allVersionsForMode = await ctx.runQuery(
            api.query.debugModeVersions,
            { name: mode.name },
          );

          // Filter only approved versions and extract version numbers
          const approvedVersions = allVersionsForMode
            .filter((v) => v.status === "approved")
            .map((v) => v.version)
            .sort();

          return {
            _id: mode._id,
            name: mode.name,
            author: mode.author,
            description: mode.description,
            votes: mode.votes,
            downloads: mode.downloads,
            updated_at: mode.updated_at,
            versions: approvedVersions,
          };
        }),
      );

      return new Response(JSON.stringify(indexData, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch modes index" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }),
});

// API endpoint to get full data for one or multiple modes
// Supports /mode/{modeName} or /mode/{modeName}&{modeName} etc.
// Also supports version-specific fetching: /mode/{modeName}@{version}
http.route({
  pathPrefix: "/api/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split("/");
      const modeName = pathParts[2]; // /mode/{modeName} -> index 2

      if (!modeName) {
        return new Response(JSON.stringify({ error: "Mode name required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Support multiple mode names separated by &
      const modeNames = modeName.split("&").filter(Boolean);

      if (modeNames.length === 0) {
        return new Response(
          JSON.stringify({ error: "Valid mode name(s) required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const modes = [];
      const notFound = [];

      // Fetch each mode by name (with optional version)
      for (const nameWithVersion of modeNames) {
        try {
          const [name, version] = nameWithVersion.split("@");

          let mode;
          if (version) {
            // Fetch specific version
            mode = await ctx.runQuery(api.query.getModeByNameAndVersion, {
              name,
              version,
            });
          } else {
            // Fetch latest approved version (existing behavior)
            mode = await ctx.runQuery(api.query.getModeByName, { name });
          }

          if (mode) {
            modes.push(mode);
            // Increment download counter for this specific mode version
            await ctx.runMutation(api.mutation.incrementDownloadByModeId, {
              modeId: mode._id,
            });
          } else {
            notFound.push(nameWithVersion);
          }
        } catch (error) {
          notFound.push(nameWithVersion);
        }
      }

      // If single mode requested, return object directly (not array)
      if (modeNames.length === 1) {
        if (modes.length === 1) {
          return new Response(JSON.stringify(modes[0], null, 2), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } else {
          return new Response(
            JSON.stringify({ error: `Mode '${modeNames[0]}' not found` }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      // Multiple modes requested, return array with metadata about not found items
      const response = {
        modes,
        ...(notFound.length > 0 && { not_found: notFound }),
        total_requested: modeNames.length,
        total_found: modes.length,
      };

      return new Response(JSON.stringify(response, null, 2), {
        status: modes.length > 0 ? 200 : 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch mode(s)" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }),
});

export default http;
