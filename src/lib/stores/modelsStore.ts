import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ParsedModel {
  value: string;
  provider: string;
  modelName: string;
  searchText: string;
}

interface ModelsState {
  // Cached models data
  models: ParsedModel[];
  lastUpdated: number | null;
  isLoading: boolean;

  // Actions
  setModels: (models: ParsedModel[]) => void;
  setLastUpdated: (timestamp: number) => void;
  setIsLoading: (loading: boolean) => void;
  clearCache: () => void;
  fetchModels: () => Promise<void>;

  // Helper to check if cache is stale
  isCacheStale: () => boolean;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const useModelsStore = create<ModelsState>()(
  persist(
    (set, get) => ({
      models: [],
      lastUpdated: null,
      isLoading: false,

      setModels: (models: ParsedModel[]) =>
        set({ models, lastUpdated: Date.now() }),

      setLastUpdated: (timestamp: number) => set({ lastUpdated: timestamp }),

      setIsLoading: (isLoading: boolean) => set({ isLoading }),

      clearCache: () => set({ models: [], lastUpdated: null }),

      fetchModels: async () => {
        const { isLoading } = get();
        if (isLoading) return; // Prevent concurrent fetches

        set({ isLoading: true });
        try {
          // Dynamic import to avoid circular dependencies
          const { api } = await import("@/../convex/_generated/api");
          const { ConvexHttpClient } = await import("convex/browser");

          // Create a one-time client for this fetch
          const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);
          const modelsData = await client.query(api.query.getModelsData);

          if (modelsData?.data) {
            const parsedModels = parseModelsData(modelsData);
            set({ models: parsedModels, lastUpdated: Date.now() });
          }
        } catch (error) {
          console.error("Failed to fetch models:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      isCacheStale: () => {
        const { lastUpdated } = get();
        if (!lastUpdated) return true;
        return Date.now() - lastUpdated > CACHE_DURATION;
      },
    }),
    {
      name: "openmodes-models-cache",
      partialize: (state) => ({
        models: state.models,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
);

// Helper function to parse raw models data into structured format
export function parseModelsData(modelsData: any): ParsedModel[] {
  if (!modelsData?.data) {
    return [];
  }

  const allModels: ParsedModel[] = [];

  try {
    // Iterate through each provider
    Object.entries(modelsData.data).forEach(
      ([providerId, providerData]: [string, any]) => {
        if (providerData?.models) {
          // Iterate through each model in the provider
          Object.entries(providerData.models).forEach(
            ([modelId, modelInfo]: [string, any]) => {
              const provider = providerData.name || providerId;
              const modelName = modelInfo.name || modelId;
              allModels.push({
                value: `${providerId}/${modelId}`,
                provider: provider,
                modelName: modelName,
                searchText: `${provider} ${modelName} ${modelId}`.toLowerCase(),
              });
            },
          );
        }
      },
    );

    // Sort by provider name, then by model name, and limit to first 100 for performance
    return allModels
      .sort(
        (a, b) =>
          a.provider.localeCompare(b.provider) ||
          a.modelName.localeCompare(b.modelName),
      )
      .slice(0, 100);
  } catch (error) {
    console.error("Error parsing models data:", error);
    return [];
  }
}

// Custom hook that manages models data with caching and automatic refresh
export function useModelsData() {
  const store = useModelsStore();

  // Initial load - only fetch if cache is empty or stale
  React.useEffect(() => {
    if (store.models.length === 0 || store.isCacheStale()) {
      store.fetchModels();
    }
  }, []); // Empty dependency array - only run on mount

  // Set up periodic refresh at :03 of every hour
  React.useEffect(() => {
    const scheduleNextRefresh = () => {
      const now = new Date();
      const nextRefresh = new Date();

      // Set to next hour at :03 minutes
      nextRefresh.setHours(now.getHours() + 1, 3, 0, 0);

      const msUntilNextRefresh = nextRefresh.getTime() - now.getTime();

      return setTimeout(() => {
        console.log("Scheduled models cache refresh");
        store.fetchModels();

        // Schedule the next refresh
        scheduleNextRefresh();
      }, msUntilNextRefresh);
    };

    const timeoutId = scheduleNextRefresh();
    return () => clearTimeout(timeoutId);
  }, []); // 🚀 REMOVED STORE DEPENDENCY - only run once on mount!

  return {
    models: store.models,
    isLoading: store.isLoading,
    isError: false, // We'll handle errors within fetchModels
    lastUpdated: store.lastUpdated,
  };
}
