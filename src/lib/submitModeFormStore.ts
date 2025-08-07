import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ContextInstruction {
  title: string;
  content: string;
}

interface McpTool {
  type: "local" | "remote";
  name: string;
  command?: string;
  url?: string;
}

interface FormData {
  name: string;
  description: string;
  mode_prompt: string;
  author: string;
}

interface SubmitModeFormState {
  formData: FormData;
  contextInstructions: ContextInstruction[];
  mcpTools: McpTool[];
  tools: Record<string, boolean>;

  // Actions
  updateFormData: (field: string, value: string) => void;
  updateContextInstructions: (instructions: ContextInstruction[]) => void;
  updateMcpTools: (tools: McpTool[]) => void;
  updateTools: (tools: Record<string, boolean>) => void;
  clearForm: () => void;
}

const initialState = {
  formData: {
    name: "",
    description: "",
    mode_prompt: "",
    author: "",
  },
  contextInstructions: [{ title: "", content: "" }],
  mcpTools: [{ type: "local" as const, name: "", command: "", url: "" }],
  tools: {},
};

export const useSubmitModeFormStore = create<SubmitModeFormState>()(
  persist(
    (set) => ({
      ...initialState,

      updateFormData: (field: string, value: string) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
        })),

      updateContextInstructions: (instructions: ContextInstruction[]) =>
        set({ contextInstructions: instructions }),

      updateMcpTools: (tools: McpTool[]) => set({ mcpTools: tools }),

      updateTools: (tools: Record<string, boolean>) => set({ tools }),

      clearForm: () => set(initialState),
    }),
    {
      name: "submit-mode-form-storage",
      partialize: (state) => ({
        formData: state.formData,
        contextInstructions: state.contextInstructions,
        mcpTools: state.mcpTools,
        tools: state.tools,
      }),
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
