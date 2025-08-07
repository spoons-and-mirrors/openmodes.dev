import { v } from "convex/values";
import { query, mutation, internalAction } from "./_generated/server";
import { api } from "./_generated/api";

// Internal action to fetch models from external API
export const fetchModelsFromAPI = internalAction({
  handler: async (ctx) => {
    try {
      const response = await fetch("https://models.dev/api.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text(); // Get raw JSON string

      // Store the raw JSON data
      await ctx.runMutation(api.models.storeModelsData, { data });

      console.log("Successfully fetched and stored models data");
    } catch (error) {
      console.error("Failed to fetch models data:", error);
    }
  },
});

// Mutation to store the raw JSON response from models.dev API
export const storeModelsData = mutation({
  args: {
    data: v.string(), // Raw JSON string from models.dev API
  },
  handler: async (ctx, args) => {
    // Remove any existing models data (we only want one row)
    const existing = await ctx.db.query("models").first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // Store the new data
    await ctx.db.insert("models", {
      data: args.data,
      lastUpdated: Date.now(),
    });
  },
});

// Query to get the latest models data
export const getModelsData = query({
  handler: async (ctx) => {
    const modelsData = await ctx.db.query("models").first();

    if (!modelsData) {
      return null;
    }

    // Parse and return the JSON data
    try {
      return {
        data: JSON.parse(modelsData.data),
        lastUpdated: modelsData.lastUpdated,
      };
    } catch (error) {
      console.error("Failed to parse models data:", error);
      return null;
    }
  },
});
