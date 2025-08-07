import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ContextInstruction, McpTool, ModeFormData, Resource } from "../types";

export type FormMode = "create" | "edit";

export interface ModeFormState {
  // Form mode (create or edit)
  mode: FormMode;

  // Core form data
  formData: ModeFormData;
  contextInstructions: ContextInstruction[];
  resources: Resource[];
  mcpTools: McpTool[];
  tools: Record<string, boolean>;

  // Edit-specific fields
  changeSummary: string;
  originalModeId?: string;
  parentVersion?: string;

  // Actions for form data
  updateFormData: (field: string, value: string) => void;
  updateTools: (tools: Record<string, boolean>) => void;

  // Actions for context instructions
  addContextInstruction: () => void;
  removeContextInstruction: (index: number) => void;
  updateContextInstruction: (
    index: number,
    field: string,
    value: string,
  ) => void;
  updateContextInstructions: (instructions: ContextInstruction[]) => void;

  // Actions for resources
  addResource: () => void;
  removeResource: (index: number) => void;
  updateResource: (index: number, field: string, value: string) => void;
  updateResources: (resources: Resource[]) => void;

  // Actions for MCP tools
  addMcpTool: () => void;
  removeMcpTool: (index: number) => void;
  updateMcpTool: (index: number, field: string, value: string) => void;
  updateMcpTools: (tools: McpTool[]) => void;

  // Actions for edit mode
  updateChangeSummary: (summary: string) => void;

  // Mode management
  initializeForCreate: () => void;
  initializeForEdit: (modeData: {
    _id: string;
    name: string;
    author: string;
    description: string;
    prompt?: string;
    instructions?: ContextInstruction[];
    resources?: Resource[];
    temperature?: string;
    model?: string;
    tools?: {
      mcp_tools?: McpTool[];
      tools?: Record<string, boolean>;
    };
    version: string;
  }) => void;
  clearForm: () => void;
}

const initialFormData: ModeFormData = {
  name: "",
  description: "",
  mode_prompt: "",
  author: "",
  temperature: "",
  model: "",
};

const initialContextInstructions: ContextInstruction[] = [
  { title: "", content: "" },
];

const initialResources: Resource[] = [
  { title: "", content: "", description: "" },
];

const initialMcpTools: McpTool[] = [
  { type: "local", name: "", command: "", url: "" },
];

const initialState = {
  mode: "create" as FormMode,
  formData: initialFormData,
  contextInstructions: initialContextInstructions,
  resources: initialResources,
  mcpTools: initialMcpTools,
  tools: {},
  changeSummary: "",
  originalModeId: undefined,
  parentVersion: undefined,
};

// Helper function to parse existing tools from mode data
function parseExistingTools(tools: any) {
  const mcpTools = tools?.mcp_tools || [];
  const disabledTools: Record<string, boolean> = {};

  if (tools?.tools) {
    Object.entries(tools.tools).forEach(([tool, enabled]) => {
      if (enabled === false) {
        disabledTools[tool] = false;
      }
    });
  }

  return { mcpTools, disabledTools };
}

export const useModeFormStore = create<ModeFormState>()(
  persist(
    (set) => ({
      ...initialState,

      // Form data actions
      updateFormData: (field: string, value: string) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
        })),

      updateTools: (tools: Record<string, boolean>) => set({ tools }),

      // Context instructions actions
      addContextInstruction: () =>
        set((state) => ({
          contextInstructions: [
            ...state.contextInstructions,
            { title: "", content: "" },
          ],
        })),

      removeContextInstruction: (index: number) =>
        set((state) => ({
          contextInstructions: state.contextInstructions.filter(
            (_, i) => i !== index,
          ),
        })),

      updateContextInstruction: (index: number, field: string, value: string) =>
        set((state) => {
          // Create a shallow copy of the array and update only the specific item
          const newInstructions = [...state.contextInstructions];
          newInstructions[index] = {
            ...newInstructions[index],
            [field]: value,
          };
          return { contextInstructions: newInstructions };
        }),

      updateContextInstructions: (instructions: ContextInstruction[]) =>
        set({ contextInstructions: instructions }),

      // Resources actions
      addResource: () =>
        set((state) => ({
          resources: [
            ...state.resources,
            { title: "", content: "", description: "" },
          ],
        })),

      removeResource: (index: number) =>
        set((state) => ({
          resources: state.resources.filter((_, i) => i !== index),
        })),

      updateResource: (index: number, field: string, value: string) =>
        set((state) => {
          // Create a shallow copy of the array and update only the specific item
          const newResources = [...state.resources];
          newResources[index] = { ...newResources[index], [field]: value };
          return { resources: newResources };
        }),

      updateResources: (resources: Resource[]) => set({ resources }),

      // MCP tools actions
      addMcpTool: () =>
        set((state) => ({
          mcpTools: [
            ...state.mcpTools,
            { type: "local", name: "", command: "", url: "" },
          ],
        })),

      removeMcpTool: (index: number) =>
        set((state) => ({
          mcpTools: state.mcpTools.filter((_, i) => i !== index),
        })),

      updateMcpTool: (index: number, field: string, value: string) =>
        set((state) => {
          // Create a shallow copy of the array and update only the specific item
          const newMcpTools = [...state.mcpTools];
          newMcpTools[index] = { ...newMcpTools[index], [field]: value };
          return { mcpTools: newMcpTools };
        }),

      updateMcpTools: (tools: McpTool[]) => set({ mcpTools: tools }),

      // Edit mode actions
      updateChangeSummary: (summary: string) => set({ changeSummary: summary }),

      // Mode management
      initializeForCreate: () => {
        // Try to load saved data from localStorage
        let savedData = null;
        try {
          const saved = localStorage.getItem("submitModeFormData");
          if (saved) {
            savedData = JSON.parse(saved);
          }
        } catch (error) {
          console.warn("Failed to load saved form data:", error);
        }

        set({
          mode: "create",
          formData: savedData?.formData || initialFormData,
          contextInstructions:
            savedData?.contextInstructions || initialContextInstructions,
          resources: savedData?.resources || initialResources,
          mcpTools: savedData?.mcpTools || initialMcpTools,
          tools: savedData?.tools || {},
          changeSummary: "",
          originalModeId: undefined,
          parentVersion: undefined,
        });
      },

      initializeForEdit: (modeData) => {
        const {
          mcpTools: initialMcpTools,
          disabledTools: initialDisabledTools,
        } = parseExistingTools(modeData.tools);

        set({
          mode: "edit",
          formData: {
            name: modeData.name,
            description: modeData.description,
            mode_prompt: modeData.prompt || "",
            author: modeData.author,
            temperature: modeData.temperature || "",
            model: modeData.model || "",
          },
          contextInstructions: modeData.instructions || [
            { title: "", content: "" },
          ],
          resources: modeData.resources?.map((resource) => ({
            ...resource,
            description: resource.description || "",
          })) || [{ title: "", content: "", description: "" }],
          mcpTools:
            initialMcpTools.length > 0 ? initialMcpTools : initialMcpTools,
          tools: initialDisabledTools,
          changeSummary: "",
          originalModeId: modeData._id,
          parentVersion: modeData.version,
        });
      },

      clearForm: () => {
        set(initialState);
        // Also clear persisted data from localStorage
        localStorage.removeItem("mode-form-storage");
      },
    }),
    {
      name: "mode-form-storage",
      partialize: (state) => {
        // Only persist create mode form data, not edit mode data
        if (state.mode === "create") {
          return {
            mode: state.mode,
            formData: state.formData,
            contextInstructions: state.contextInstructions,
            resources: state.resources,
            mcpTools: state.mcpTools,
            tools: state.tools,
          };
        }
        // Don't persist edit mode data - it should be loaded fresh each time
        return { mode: "create" };
      },
      // Ensure we always have at least the minimum required structure
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure contextInstructions has at least one empty instruction
          if (
            !state.contextInstructions ||
            state.contextInstructions.length === 0
          ) {
            state.contextInstructions = [{ title: "", content: "" }];
          }
          // Ensure resources has at least one empty resource
          if (!state.resources || state.resources.length === 0) {
            state.resources = [{ title: "", content: "", description: "" }];
          }
          // Ensure mcpTools has at least one empty tool
          if (!state.mcpTools || state.mcpTools.length === 0) {
            state.mcpTools = [
              { type: "local", name: "", command: "", url: "" },
            ];
          }
        }
      },
    },
  ),
);
